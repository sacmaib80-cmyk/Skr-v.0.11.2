# SakuraQ — Build APK for Firebase App Distribution
# Run from D:\git  (PowerShell)

$version    = "v0.18.4"
$apkName    = "sakuraq-$version.apk"
$apkDebug   = "android\app\build\outputs\apk\debug\app-debug.apk"

Write-Host ""
Write-Host "=== SakuraQ Firebase Build ===" -ForegroundColor Magenta
Write-Host "Version : $version" -ForegroundColor Cyan

# 1. Sync web assets → Android (move www/sakuraq.apk out first to avoid bundling it inside the APK)
Write-Host "`n[1/3] Syncing Capacitor..." -ForegroundColor Yellow
$wwwApk = "www\sakuraq.apk"
$tmpApk  = "sakuraq-tmp-build.apk"
$movedApk = $false
if (Test-Path $wwwApk) {
    Move-Item $wwwApk $tmpApk -Force
    $movedApk = $true
}
npx cap sync android
$syncOk = $?
if ($movedApk) { Move-Item $tmpApk $wwwApk -Force }
if (-not $syncOk) { Write-Host "cap sync failed" -ForegroundColor Red; exit 1 }

# 2. Build debug APK
Write-Host "`n[2/3] Building APK..." -ForegroundColor Yellow
Set-Location android
.\gradlew assembleDebug
$buildOk = $?
Set-Location ..
if (-not $buildOk) { Write-Host "Gradle build failed" -ForegroundColor Red; exit 1 }

# 3. Copy to Downloads with release name
Write-Host "`n[3/3] Copying APK..." -ForegroundColor Yellow
$apkDest = "$env:USERPROFILE\Downloads\$apkName"
if (Test-Path $apkDebug) {
    Copy-Item $apkDebug $apkDest -Force
    $sizeMB = [math]::Round((Get-Item $apkDest).Length / 1MB, 1)
    Write-Host ""
    Write-Host "Done!  $apkDest  ($sizeMB MB)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Upload to Firebase App Distribution:" -ForegroundColor Cyan
    Write-Host "  https://console.firebase.google.com/project/sakuraq/appdistribution" -ForegroundColor White
} else {
    Write-Host "APK not found: $apkDebug" -ForegroundColor Red
    exit 1
}
