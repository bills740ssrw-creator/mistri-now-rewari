Add-Type -AssemblyName System.Drawing

$W = 1200
$H = 630
$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

function New-RoundPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = [float]($r * 2)
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

function New-Font($size, $style) {
  return New-Object System.Drawing.Font("Segoe UI", [float]$size, $style, [System.Drawing.GraphicsUnit]::Pixel)
}

$ink = [System.Drawing.Color]::FromArgb(11, 28, 21)
$cream = [System.Drawing.Color]::FromArgb(253, 251, 246)
$muted = [System.Drawing.Color]::FromArgb(183, 204, 194)
$dim = [System.Drawing.Color]::FromArgb(120, 148, 135)
$emerald = [System.Drawing.Color]::FromArgb(47, 191, 143)
$emeraldDark = [System.Drawing.Color]::FromArgb(23, 122, 90)
$saffron = [System.Drawing.Color]::FromArgb(240, 164, 58)

# Background
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point(0, 0)),
  (New-Object System.Drawing.Point($W, $H)),
  [System.Drawing.Color]::FromArgb(5, 17, 12),
  [System.Drawing.Color]::FromArgb(19, 61, 44)
)
$g.FillRectangle($bg, 0, 0, $W, $H)

# Emerald glow
$glow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 47, 191, 143))
$g.FillEllipse($glow, 620, -180, 760, 760)
$glow2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(18, 240, 164, 58))
$g.FillEllipse($glow2, -220, 430, 520, 520)

# Dot grid
$dot = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(16, 255, 255, 255))
for ($x = 40; $x -lt $W; $x += 30) {
  for ($y = 40; $y -lt $H; $y += 30) {
    $g.FillEllipse($dot, $x, $y, 1.4, 1.4)
  }
}

# Logo mark
$markPath = New-RoundPath 72 58 58 58 17
$markBrush = New-Object System.Drawing.SolidBrush($emerald)
$g.FillPath($markBrush, $markPath)
$mFont = New-Font 30 ([System.Drawing.FontStyle]::Bold)
$mBrush = New-Object System.Drawing.SolidBrush($ink)
$mFmt = New-Object System.Drawing.StringFormat
$mFmt.Alignment = [System.Drawing.StringAlignment]::Center
$mFmt.LineAlignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("M", $mFont, $mBrush, (New-Object System.Drawing.RectangleF(72, 58, 58, 58)), $mFmt)

$brandFont = New-Font 23 ([System.Drawing.FontStyle]::Bold)
$brandBrush = New-Object System.Drawing.SolidBrush($cream)
$g.DrawString("Mistri Now", $brandFont, $brandBrush, 146, 62)
$locFont = New-Font 13 ([System.Drawing.FontStyle]::Regular)
$locBrush = New-Object System.Drawing.SolidBrush($dim)
$g.DrawString("REWARI  /  HARYANA  /  123401", $locFont, $locBrush, 147, 92)

# Eyebrow
$eyeFont = New-Font 15 ([System.Drawing.FontStyle]::Bold)
$eyeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(167, 215, 192))
$g.DrawString("GHAR KA KAAM, EK TAP PAR", $eyeFont, $eyeBrush, 74, 160)
$g.FillRectangle((New-Object System.Drawing.SolidBrush($emerald)), 74, 187, 42, 3)

# Headline
$hFont = New-Font 76 ([System.Drawing.FontStyle]::Bold)
$hBrush = New-Object System.Drawing.SolidBrush($cream)
$g.DrawString("Ghar ka kaam,", $hFont, $hBrush, 68, 204)
$g.DrawString("mistri now.", $hFont, $hBrush, 68, 286)

# Subtitle
$subFont = New-Font 22 ([System.Drawing.FontStyle]::Regular)
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 220, 210))
$g.DrawString("Verified plumbers, electricians, AC and RO technicians.", $subFont, $subBrush, 74, 384)
$g.DrawString("Fixed prices. At your door in under 60 minutes.", $subFont, $subBrush, 74, 414)

# Chips
$chipFont = New-Font 14 ([System.Drawing.FontStyle]::Bold)
$chipTextBrush = New-Object System.Drawing.SolidBrush($cream)
$chipBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 167, 215, 192), 1)
$chips = @(
  @{ x = 74; w = 138; t = "Fixed pricing" },
  @{ x = 225; w = 168; t = "Aadhaar verified" },
  @{ x = 406; w = 158; t = "7-day warranty" }
)
foreach ($chip in $chips) {
  $cp = New-RoundPath $chip.x 462 $chip.w 38 19
  $g.DrawPath($chipBorder, $cp)
  $g.DrawString($chip.t, $chipFont, $chipTextBrush, ($chip.x + 16), 471)
}

# Footer bar
$g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 255, 255, 255))), 72, 556, 1, 40)
$phoneFont = New-Font 27 ([System.Drawing.FontStyle]::Bold)
$g.DrawString("83071 21221", $phoneFont, (New-Object System.Drawing.SolidBrush($cream)), 74, 540)
$hoursFont = New-Font 13 ([System.Drawing.FontStyle]::Regular)
$g.DrawString("7 AM - 9 PM, all 7 days", $hoursFont, (New-Object System.Drawing.SolidBrush($muted)), 76, 577)
$legalFont = New-Font 13 ([System.Drawing.FontStyle]::Regular)
$g.DrawString("Lakshya Yadav Enterprises  -  mistrinow.in", $legalFont, (New-Object System.Drawing.SolidBrush($dim)), 74, 600)

# Card shadow
for ($i = 6; $i -ge 1; $i--) {
  $sp = New-RoundPath (752 + $i) (140 + $i * 2) 378 352 30
  $alpha = 8 + (6 - $i) * 3
  $sb = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($alpha, 0, 0, 0))
  $g.FillPath($sb, $sp)
}

# Card
$cardPath = New-RoundPath 752 140 378 352 30
$cardBrush = New-Object System.Drawing.SolidBrush($cream)
$g.FillPath($cardBrush, $cardPath)

# Card header icon
$iconPath = New-RoundPath 776 164 46 46 14
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(228, 246, 239))), $iconPath)
$acFont = New-Font 16 ([System.Drawing.FontStyle]::Bold)
$g.DrawString("AC", $acFont, (New-Object System.Drawing.SolidBrush($emeraldDark)), 787, 179)

$titleFont = New-Font 19 ([System.Drawing.FontStyle]::Bold)
$g.DrawString("AC Gas Filling", $titleFont, (New-Object System.Drawing.SolidBrush($ink)), 834, 168)
$timeFont = New-Font 13 ([System.Drawing.FontStyle]::Regular)
$g.DrawString("Today, 4:00 PM  -  Sector 6", $timeFont, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(110, 120, 115))), 834, 196)

# Status pill
$pillPath = New-RoundPath 1002 164 104 24 12
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 244, 222))), $pillPath)
$pillFont = New-Font 10 ([System.Drawing.FontStyle]::Bold)
$g.DrawString("ON THE WAY", $pillFont, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(154, 98, 12))), 1013, 171)

# Divider
$divPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(232, 232, 225), 1)
$g.DrawLine($divPen, 776, 228, 1106, 228)

# Price
$labelFont = New-Font 12 ([System.Drawing.FontStyle]::Regular)
$g.DrawString("FIXED VISIT PRICE", $labelFont, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(130, 140, 135))), 776, 248)
$priceFont = New-Font 44 ([System.Drawing.FontStyle]::Bold)
$g.DrawString("Rs 3,399", $priceFont, (New-Object System.Drawing.SolidBrush($ink)), 774, 266)
$g.DrawString("parts included", (New-Font 12 ([System.Drawing.FontStyle]::Regular)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(130, 140, 135))), 990, 288)

# Progress
$g.DrawString("Imran is 12 minutes away", (New-Font 13 ([System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush($ink)), 776, 342)
$track = New-RoundPath 776 368 330 8 4
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(228, 232, 226))), $track)
$fill = New-RoundPath 776 368 246 8 4
$g.FillPath((New-Object System.Drawing.SolidBrush($emerald)), $fill)

# Steps
$stepLabels = @("Booked", "Assigned", "On the way", "Done")
$stepFont = New-Font 10 ([System.Drawing.FontStyle]::Regular)
for ($s = 0; $s -lt 4; $s++) {
  $cx = 782 + $s * 100
  $done = $s -le 2
  $g.FillEllipse((New-Object System.Drawing.SolidBrush($(if ($done) { $emerald } else { [System.Drawing.Color]::FromArgb(214, 220, 213) }))), $cx, 388, 9, 9)
  $g.DrawString($stepLabels[$s], $stepFont, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 132, 126))), ($cx - 4), 404)
}

# Trust row
$trustPath = New-RoundPath 776 436 330 38 12
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(238, 248, 242))), $trustPath)
$trustFont = New-Font 12 ([System.Drawing.FontStyle]::Bold)
$g.DrawString("OTP-verified start  -  7-day warranty", $trustFont, (New-Object System.Drawing.SolidBrush($emeraldDark)), 795, 448)

# Save
New-Item -ItemType Directory -Force -Path (Join-Path $PSScriptRoot "..\public") | Out-Null
$out = Join-Path $PSScriptRoot "..\public\og.png"
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()

$info = Get-Item $out
Write-Output "Wrote $($info.FullName) ($($info.Length) bytes)"
