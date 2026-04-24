Add-Type -AssemblyName System.Drawing

function New-RoundedRectPath {
  param(
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [float]$Radius
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2

  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()

  return $path
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$output = Join-Path $root "og-image.png"

$width = 1200
$height = 630
$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
$bgColorA = [System.Drawing.Color]::FromArgb(10, 25, 47)
$bgColorB = [System.Drawing.Color]::FromArgb(17, 34, 64)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $bgColorA, $bgColorB, 35
$graphics.FillRectangle($bgBrush, $rect)

$goldMistBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(28, 242, 201, 76))
$blueMistBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(24, 59, 130, 246))
$graphics.FillEllipse($goldMistBrush, 20, -40, 520, 360)
$graphics.FillEllipse($blueMistBrush, 760, 30, 300, 300)

$gridPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(24, 35, 53, 84)), 1
for ($x = 0; $x -le $width; $x += 120) {
  $graphics.DrawLine($gridPen, $x, 0, $x, $height)
}
for ($y = 0; $y -le $height; $y += 90) {
  $graphics.DrawLine($gridPen, 0, $y, $width, $y)
}

$outerRingPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(72, 242, 201, 76)), 2
$innerRingPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(215, 242, 201, 76)), 3
$graphics.DrawEllipse($outerRingPen, 800, 48, 242, 242)
$graphics.DrawEllipse($innerRingPen, 836, 84, 170, 170)

$chevronPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(195, 255, 224, 130)), 4
$chevronPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$chevronPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLines($chevronPen, @(
  [System.Drawing.Point]::new(862, 252),
  [System.Drawing.Point]::new(940, 172),
  [System.Drawing.Point]::new(1018, 252)
))

$badgeBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(180, 9, 18, 33))
$badgePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(195, 242, 201, 76)), 2
$badgePath = New-RoundedRectPath -X 88 -Y 88 -Width 370 -Height 50 -Radius 25
$graphics.FillPath($badgeBrush, $badgePath)
$graphics.DrawPath($badgePen, $badgePath)

$ctaPath = New-RoundedRectPath -X 88 -Y 505 -Width 310 -Height 54 -Radius 27

$whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(248, 250, 252))
$softBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(203, 213, 225))
$mutedBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(136, 146, 176))
$goldBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 224, 130))
$goldSolidBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(242, 201, 76))
$darkBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(10, 25, 47))

$badgeFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$headlineFont = New-Object System.Drawing.Font("Georgia", 54, [System.Drawing.FontStyle]::Bold)
$subheadFont = New-Object System.Drawing.Font("Segoe UI", 21, [System.Drawing.FontStyle]::Regular)
$metaFont = New-Object System.Drawing.Font("Segoe UI", 17, [System.Drawing.FontStyle]::Regular)
$ctaFont = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
$smallFont = New-Object System.Drawing.Font("Segoe UI", 17, [System.Drawing.FontStyle]::Regular)

$graphics.DrawString("DOCTORAL PLATFORM LAUNCHING SOON", $badgeFont, $goldBrush, 110, 103)
$graphics.DrawString("Dr. Jack Dee", $headlineFont, $whiteBrush, 88, 214)
$graphics.DrawString("The next evolution of executive strategy,", $subheadFont, $softBrush, 88, 326)
$graphics.DrawString("technology leadership, and practitioner-scholar insight.", $subheadFont, $softBrush, 88, 360)
$graphics.DrawString("Executive strategy. AI transformation. Leadership visibility. Doctoral thought leadership.", $metaFont, $mutedBrush, 88, 458)

$graphics.FillPath($goldSolidBrush, $ctaPath)
$graphics.DrawString("drjackdee.com", $ctaFont, $darkBrush, 164, 521)

$graphics.DrawString("MrJackDee", $smallFont, $softBrush, 812, 482)
$graphics.DrawString("→", $smallFont, $goldBrush, 949, 482)
$graphics.DrawString("DrJackDee", $smallFont, $whiteBrush, 984, 482)

$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)

$badgePath.Dispose()
$ctaPath.Dispose()
$gridPen.Dispose()
$outerRingPen.Dispose()
$innerRingPen.Dispose()
$chevronPen.Dispose()
$badgePen.Dispose()
$badgeBrush.Dispose()
$goldMistBrush.Dispose()
$blueMistBrush.Dispose()
$whiteBrush.Dispose()
$softBrush.Dispose()
$mutedBrush.Dispose()
$goldBrush.Dispose()
$goldSolidBrush.Dispose()
$darkBrush.Dispose()
$badgeFont.Dispose()
$headlineFont.Dispose()
$subheadFont.Dispose()
$metaFont.Dispose()
$ctaFont.Dispose()
$smallFont.Dispose()
$bgBrush.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
