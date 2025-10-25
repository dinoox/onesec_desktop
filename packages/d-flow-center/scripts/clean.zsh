#!/bin/bash

APP_NAME="秒言"
BUNDLE_ID="com.ripplestar.miaoyan"  # 替换为实际的 Bundle ID

# 删除应用
sudo rm -rf "/Applications/${APP_NAME}.app"

# 删除用户数据
rm -rf ~/Library/Application\ Support/"${APP_NAME}"
rm -rf ~/Library/Application\ Support/"${BUNDLE_ID}"
rm -rf ~/Library/Caches/"${APP_NAME}"
rm -rf ~/Library/Caches/"${BUNDLE_ID}"
rm -rf ~/Library/Preferences/"${BUNDLE_ID}".plist
rm -rf ~/Library/Logs/"${APP_NAME}"
rm -rf ~/Library/Saved\ Application\ State/"${BUNDLE_ID}".savedState

# 删除系统级数据
sudo rm -rf /Library/Application\ Support/"${APP_NAME}"
sudo rm -rf /Library/Caches/"${BUNDLE_ID}"

# 清理启动项
rm -rf ~/Library/LaunchAgents/"${BUNDLE_ID}".*
sudo rm -rf /Library/LaunchAgents/"${BUNDLE_ID}".*
sudo rm -rf /Library/LaunchDaemons/"${BUNDLE_ID}".*

echo "清理完成！"
