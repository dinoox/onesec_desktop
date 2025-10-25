const path = require('path')
const { notarize } = require('@electron/notarize')

const APPLE_TEAM_ID = process.env.TEAM_ID || 'PNG2RBG62Z'
const APPLE_ID = process.env.APPLE_ID || 'liyunba8@gmail.com'
const APPLE_APP_SPECIFIC_PASSWORD = process.env.APPLE_ID_PASSWORD || 'awkm-mtbp-yzps-oqgw'

// export APPLE_TEAM_ID="PNG2RBG62Z" APPLE_ID="liyunba8@gmail.com" APPLE_APP_SPECIFIC_PASSWORD="awkm-mtbp-yzps-oqgw" teamId="PNG2RBG62Z"
// xcrun notarytool submit "xxxxxx.dmg" --apple-id "liyunba8@gmail.com" --team-id "PNG2RBG62Z" --password "awkm-mtbp-yzps-oqgw"
// xcrun notarytool history --apple-id "liyunba8@gmail.com" --team-id "PNG2RBG62Z" --password "awkm-mtbp-yzps-oqgw"
// xcrun notarytool log YOUR_REQUEST_ID --apple-id "liyunba8@gmail.com" --team-id "PNG2RBG62Z" --password "awkm-mtbp-yzps-oqgw"
// xcrun stapler staple release/1.0.0/秒言-Mac-arm64-1.0.0-Installer.dmg
// spctl -a -vv -t install release/1.0.0/mac-arm64/秒言.app

async function notarizeApp() {
    const appPath = path.join(__dirname, '../release/1.0.0/秒言-Mac-arm64-1.0.0-Installer.dmg');
    console.log('Start notarize app:', appPath)

    await notarize({
        appPath: appPath,
        appleId: APPLE_ID,
        appleIdPassword: APPLE_APP_SPECIFIC_PASSWORD,
        teamId: APPLE_TEAM_ID
    })
    console.log('Notarize app success')
}

notarizeApp().catch(console.error)
