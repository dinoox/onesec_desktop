const path = require('path')
const { notarize } = require('@electron/notarize')

const TEAM_ID = process.env.TEAM_ID || 'PNG2RBG62Z'
const APPLE_ID = process.env.APPLE_ID || 'liyunba8@gmail.com'
const APPLE_ID_PASSWORD = process.env.APPLE_ID_PASSWORD || 'awkm-mtbp-yzps-oqgw'

// xcrun notarytool history --apple-id "liyunba8@gmail.com" --team-id "PNG2RBG62Z" --password "awkm-mtbp-yzps-oqgw"
// xcrun notarytool log YOUR_REQUEST_ID --apple-id "liyunba8@gmail.com" --team-id "PNG2RBG62Z" --password "awkm-mtbp-yzps-oqgw"

async function notarizeApp() {
    const appPath = path.join(__dirname, '../release/1.0.0/mac-arm64/秒言.app');
    console.log('Start notarize app:', appPath)

    await notarize({
        appPath: appPath,
        appleId: APPLE_ID,
        appleIdPassword: APPLE_ID_PASSWORD,
        teamId: TEAM_ID
    })
    console.log('Notarize app success')
}

notarizeApp().catch(console.error)
