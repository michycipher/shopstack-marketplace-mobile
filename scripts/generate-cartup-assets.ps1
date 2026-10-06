Add-Type -AssemblyName System.Drawing

$assetDirectory = Join-Path $PSScriptRoot '..\assets\images'
$navy = [System.Drawing.ColorTranslator]::FromHtml('#111A2E')
$yellow = [System.Drawing.ColorTranslator]::FromHtml('#FBBF24')

function New-Canvas([int]$size, [bool]$transparent) {
  $bitmap = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  if ($transparent) { $graphics.Clear([System.Drawing.Color]::Transparent) }
  else { $graphics.Clear($yellow) }
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function Add-Mark($graphics, [int]$size, [bool]$withTile) {
  $tileSize = [int]($size * 0.68)
  $tileOffset = [int](($size - $tileSize) / 2)
  if ($withTile) {
    $tileBrush = New-Object System.Drawing.SolidBrush($yellow)
    $tilePath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $radius = [int]($tileSize * 0.18)
    $tilePath.AddArc($tileOffset, $tileOffset, $radius * 2, $radius * 2, 180, 90)
    $tilePath.AddArc($tileOffset + $tileSize - $radius * 2, $tileOffset, $radius * 2, $radius * 2, 270, 90)
    $tilePath.AddArc($tileOffset + $tileSize - $radius * 2, $tileOffset + $tileSize - $radius * 2, $radius * 2, $radius * 2, 0, 90)
    $tilePath.AddArc($tileOffset, $tileOffset + $tileSize - $radius * 2, $radius * 2, $radius * 2, 90, 90)
    $tilePath.CloseFigure()
    $graphics.FillPath($tileBrush, $tilePath)
    $tilePath.Dispose()
    $tileBrush.Dispose()
  }

  $fontSize = [int]($size * 0.43)
  $fontStyle = [System.Drawing.FontStyle]([int][System.Drawing.FontStyle]::Bold -bor [int][System.Drawing.FontStyle]::Italic)
  $font = [System.Drawing.Font]::new('Arial', $fontSize, $fontStyle, [System.Drawing.GraphicsUnit]::Pixel)
  $markBrush = New-Object System.Drawing.SolidBrush($navy)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $markBounds = New-Object System.Drawing.RectangleF(0, [float]($size * 0.01), $size, $size)
  $graphics.DrawString('C', $font, $markBrush, $markBounds, $format)
  $format.Dispose()
  $markBrush.Dispose()
  $font.Dispose()
}

function Save-Canvas($canvas, [string]$path) {
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Bitmap.Dispose()
}

$icon = New-Canvas 1024 $false
Add-Mark $icon.Graphics 1024 $false
Save-Canvas $icon (Join-Path $assetDirectory 'icon.png')

$splash = New-Canvas 1024 $true
Add-Mark $splash.Graphics 1024 $true
Save-Canvas $splash (Join-Path $assetDirectory 'splash-icon.png')

$background = New-Canvas 512 $false
Save-Canvas $background (Join-Path $assetDirectory 'android-icon-background.png')

$foreground = New-Canvas 512 $true
Add-Mark $foreground.Graphics 512 $false
Save-Canvas $foreground (Join-Path $assetDirectory 'android-icon-foreground.png')

$monochrome = New-Canvas 432 $true
Add-Mark $monochrome.Graphics 432 $false
Save-Canvas $monochrome (Join-Path $assetDirectory 'android-icon-monochrome.png')

$favicon = New-Canvas 48 $false
Add-Mark $favicon.Graphics 48 $false
Save-Canvas $favicon (Join-Path $assetDirectory 'favicon.png')
