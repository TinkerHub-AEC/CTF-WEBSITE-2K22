const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('../config/serviceAccountKey.json');

var regSheet;
var questSheet;
var questRows;

async function verifyTeam({ token, teamName }) {
    if (!regSheet) {
        try {
            regSheet = new GoogleSpreadsheet(process.env.REGISTRATION_SPREADSHEET_ID);
            await regSheet.useServiceAccountAuth({
                client_email: process.env.CLIENT_EMAIL,
                private_key: process.env.PRIVATE_KEY,
            });
            await regSheet.loadInfo();
        } catch (err) {
            throw err;
        }
    }
    const rows = await regSheet.sheetsByIndex[1].getRows();
    token = token.replace(/\s/g, '');
    const row = rows.find((row, _index, _obj) => {
        return row.Token.replace(/\s/g, '') === token;
    });
    if (row) {
        if (teamName.replace(/\s/g, '').toLowerCase() === row.Name.replace(/\s/g, '').toLowerCase())
            return true;
        else {
            throw Error("incorrect TeamName");
        }
    } else {
        throw Error("token not found");
    }
}

async function getQuestions() {
    try {
        if (!questRows) {
            await refreshQuestions();
        }
        return questRows;
    } catch (err) {
        console.log(err);
    }
}


async function refreshQuestions(_next) {
    questSheet = new GoogleSpreadsheet(process.env.QUESTION_SPREADSHEET_ID);
    try {
        await questSheet.useServiceAccountAuth({
            client_email: process.env.CLIENT_EMAIL,
            private_key: process.env.PRIVATE_KEY,
        });

        await questSheet.loadInfo();
        await new Promise(r => setTimeout(r, 2000));
        questRows = await questSheet.sheetsByIndex[0].getRows();
    } catch (err) {
        console.log(err);
    }
}
module.exports = { verifyTeam, getQuestions, refreshQuestions };
