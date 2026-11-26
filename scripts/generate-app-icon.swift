// Renders the ShopVerse app icon (Wrathcode brand colours) with CoreGraphics.
// Usage: swift scripts/generate-app-icon.swift <out.png> [square|rounded|circle|foreground|background] [px]
// Geometry mirrors src/components/Logo.tsx (fractions of the canvas size).
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
let outPath = args.count > 1 ? args[1] : "icon.png"
let shape = args.count > 2 ? args[2] : "square"
let S: CGFloat = args.count > 3 ? CGFloat(Double(args[3]) ?? 1024) : 1024

func rgb(_ hex: UInt32, _ a: CGFloat = 1) -> CGColor {
  CGColor(srgbRed: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255,
          blue: CGFloat(hex & 0xFF) / 255, alpha: a)
}
let space = CGColorSpace(name: CGColorSpace.sRGB)!
let ctx = CGContext(data: nil, width: Int(S), height: Int(S), bitsPerComponent: 8, bytesPerRow: 0,
                    space: space, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
// Flip so y grows downward like the RN layout.
ctx.translateBy(x: 0, y: S); ctx.scaleBy(x: 1, y: -1)

func writeAndExit() -> Never {
  let img = ctx.makeImage()!
  let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: outPath) as CFURL, UTType.png.identifier as CFString, 1, nil)!
  CGImageDestinationAddImage(dest, img, nil); CGImageDestinationFinalize(dest)
  print("wrote \(outPath) (\(shape))")
  exit(0)
}

let full = CGRect(x: 0, y: 0, width: S, height: S)
switch shape {
case "rounded":
  let inset: CGFloat = S * 0.04
  ctx.addPath(CGPath(roundedRect: full.insetBy(dx: inset, dy: inset), cornerWidth: S * 0.22, cornerHeight: S * 0.22, transform: nil))
  ctx.clip()
case "circle":
  ctx.addEllipse(in: full.insetBy(dx: S * 0.02, dy: S * 0.02)); ctx.clip()
default: break
}

func linear(_ colors: [CGColor], from: CGPoint, to: CGPoint) {
  let g = CGGradient(colorsSpace: space, colors: colors as CFArray, locations: nil)!
  ctx.drawLinearGradient(g, start: from, end: to, options: [.drawsBeforeStartLocation, .drawsAfterEndLocation])
}
if shape != "foreground" {
  // Background: deep plum → violet → orchid
  linear([rgb(0x410574), rgb(0x7C03B2), rgb(0xA218C2)], from: .zero, to: CGPoint(x: S, y: S))
  // Magenta glow bottom-right
  let glow = CGGradient(colorsSpace: space, colors: [rgb(0xDE24F8, 0.85), rgb(0xDE24F8, 0)] as CFArray, locations: [0, 1])!
  ctx.drawRadialGradient(glow, startCenter: CGPoint(x: S * 0.9, y: S * 0.95), startRadius: 0,
                         endCenter: CGPoint(x: S * 0.9, y: S * 0.95), endRadius: S * 0.62, options: [])
}
if shape == "background" { writeAndExit() }
if shape == "foreground" {
  // Android adaptive icon: keep the art inside the 66% safe zone.
  ctx.translateBy(x: S / 2, y: S / 2); ctx.scaleBy(x: 0.62, y: 0.62); ctx.translateBy(x: -S / 2, y: -S / 2)
}

// Swoosh (lower half ring)
ctx.setLineCap(.round)
ctx.setStrokeColor(rgb(0xFFFFFF, 0.6)); ctx.setLineWidth(S * 0.028)
ctx.addArc(center: CGPoint(x: S * 0.5, y: S * 0.5), radius: S * 0.36, startAngle: 0, endAngle: .pi, clockwise: false)
ctx.strokePath()
// Bag handle (upper half ring)
ctx.setStrokeColor(rgb(0xFFFFFF)); ctx.setLineWidth(S * 0.04)
ctx.addArc(center: CGPoint(x: S * 0.5, y: S * 0.37), radius: S * 0.098, startAngle: .pi, endAngle: 0, clockwise: false)
ctx.strokePath()
// Bag body
ctx.setFillColor(rgb(0xFFFFFF))
ctx.addPath(CGPath(roundedRect: CGRect(x: S * 0.3, y: S * 0.37, width: S * 0.4, height: S * 0.34),
                   cornerWidth: S * 0.06, cornerHeight: S * 0.06, transform: nil))
ctx.fillPath()
// Gem (rotated square) with brand gradient
ctx.saveGState()
ctx.translateBy(x: S * 0.5, y: S * 0.54); ctx.rotate(by: .pi / 4)
let gem = CGRect(x: -S * 0.07, y: -S * 0.07, width: S * 0.14, height: S * 0.14)
ctx.addPath(CGPath(roundedRect: gem, cornerWidth: S * 0.02, cornerHeight: S * 0.02, transform: nil)); ctx.clip()
linear([rgb(0x7C03B2), rgb(0xDE24F8)], from: CGPoint(x: gem.minX, y: gem.minY), to: CGPoint(x: gem.maxX, y: gem.maxY))
ctx.restoreGState()

writeAndExit()
