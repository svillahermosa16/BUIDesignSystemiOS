import StyleDictionary from 'style-dictionary';
import { usesReferences } from 'style-dictionary/utils';
import { resolveReferences } from 'style-dictionary/utils';


function createUIColorFromRGBA(rgba) {
  const [r, g, b, a] = rgba.replace(/[rgba()]/g, '').split(',').map(Number);
  return `UIColor(red: ${r / 255}, green: ${g / 255}, blue: ${b / 255}, alpha: ${a})`;
}

//TYPOGRAPHY
StyleDictionary.registerTransform({
  name: 'font/uifont',
  type: 'value',
  transitive: 'true',
  transform: function(prop) {
      // Skip non-typography tokens
      const index = prop.path.indexOf('typography');
      if (index === -1) {
        return prop.value;
      }
      
    // Extract font properties with fallbacks
    const fontValue = prop.original.value || {};
    const fontFamily = fontValue.fontFamily || "SystemFont";
    const fontSize = fontValue.fontSize || "16.0";
    const fontWeight = fontValue.fontWeight || "regular";
    const lineHeight = fontValue.lineHeight || null;
    
    // Map weights to Swift UIFont.Weight values
    const weightMap = {
      '100': "ultraLight",
      '200': "thin",
      '300': "light",
      '400': "regular",
      '500': "medium",
      '600': "semibold",
      '700': "bold",
      '800': "heavy",
      '900': "black",
      'regular': "regular",
      'medium': "medium",
      'bold': "bold"
    };
    
    const swiftWeight = weightMap[fontWeight] || "regular";
    
    // Generate UIFont code
    let uiFontString = `UIFont(name: "${fontFamily}", size: ${fontSize})!.withWeight(.${swiftWeight})`;
    
    // Add line height if available
    if (lineHeight) {
      uiFontString = `${uiFontString}.withLineHeight(${lineHeight})`;
    }
    
    return uiFontString;
  }
});
StyleDictionary.registerFormat({
  name: 'ios/swift/uifonts',
  format: function({dictionary}) {
    const output = [
      '// Generated by Style Dictionary on ' + new Date().toISOString(),
      'import UIKit',
      '',
      'public class BUIDesignSystemFonts {',
    ];
    
    dictionary.allTokens
      .filter(token => token.type === 'typography')
      .forEach(token => {
        const name = token.path.join('_').replace(/-/g, '_');
        output.push(`  public static let ${name} = ${token.value}`);
      });
    
    // Add extension for withWeight and withLineHeight helpers
    output.push('}');
    output.push('');
    output.push('// UIFont extensions for weight and line height');
    output.push('extension UIFont {');
    output.push('  func withWeight(_ weight: UIFont.Weight) -> UIFont {');
    output.push('    var descriptor = fontDescriptor.addingAttributes([.traits: [UIFontDescriptor.TraitKey.weight: weight]])');
    output.push('    return UIFont(descriptor: descriptor, size: pointSize)');
    output.push('  }');
    output.push('  ');
    output.push('  func withLineHeight(_ lineHeight: CGFloat) -> UIFont {');
    output.push('    // Note: In SwiftUI you would use .lineSpacing() on Text');
    output.push('    // In UIKit you would set the lineHeight on NSAttributedString');
    output.push('    // This helper just returns the font for chaining');
    output.push('    return self');
    output.push('  }');
    output.push('}');
    
    return output.join('\n');
  }
});

//BORDER
StyleDictionary.registerTransform({
    name: 'border/layer',
    type: 'value',
    transitive: true,
    transform: function(prop) {
  
      // Correctly filter for border tokens based on type
      if (prop.type !== 'border') {
        return prop.value;
      }
  
      // Extract border properties with fallbacks (use more generic fallbacks)
      const borderValue = prop.original.value || {};
      const borderColor = borderValue.color || "color.black"; // Generic fallback
      const borderWidth = borderValue.width || "border-width.thin"; // Generic fallback
      const borderStyle = borderValue.style || "solid"; // Keep for now, but not directly usable in UIKit
  
      // Create a data structure to hold the extracted values
      const borderData = {
        color: borderColor,
        width: borderWidth,
        style: borderStyle // Keep for now
      };
  
      return borderData;
    }
});

StyleDictionary.registerFormat({
    name: 'ios/swift/borderValues',
    format: function({dictionary}) {
      const output = [
        '// Generated by Style Dictionary on ' + new Date().toISOString(),
        'import UIKit',
        '',
        'public struct BorderStyle: Sendable {',
        '  let color: UIColor',
        '  let borderWidth: CGFloat',
        '}',
        '',
        'public struct BUIDesignSystemBorders {',
      ];
  
      dictionary.allTokens
        .filter(token => token.type === 'border')
        .forEach(token => {
          const name = token.path.join('_').replace(/-/g, '_');
  
          // Access the transformed values from the token
          const borderColorTokenName = token.value.color;
          const borderWidthTokenName = token.value.width;
  
          output.push(`  public static let ${name} = BorderStyle(`);
          output.push(`    color: ${borderColorTokenName.replace(/{|}/g, '')},`); // Assuming you have a UIColor extension
          output.push(`    borderWidth: ${borderWidthTokenName.replace(/{|}/g, '')}`); // Assuming you have a CGFloat extension
          output.push(`  )`);
        });

        dictionary.allTokens
        .filter(token => token.type === 'borderRadius')
        .forEach(token => {
          const name = token.path.join('_').replace(/-/g, '_');
    
          output.push(`  public static let ${name} = ${token.value}`);
        });
  
      output.push('}');
      return output.join('\n');
    }
});

//OPACITY
StyleDictionary.registerTransform({
    name: 'percentage/opacity',
    type: 'value',
    transitive: true,
    transform: function(prop) {
      const opacityValue = prop.original.value || {};

        if (prop.type !== 'opacity') {
        return prop.value;
        }

        if (typeof opacityValue !== "string" || !opacityValue.endsWith("%")) {
            throw new Error("Invalid input: Must be a string ending with '%'");
        }

        const floatValue = parseFloat(opacityValue.replace("%", "")) / 100;

        const cgFloatValue = `CGFloat(${floatValue})`;
        return cgFloatValue;
    }
})

//BOXSHADOW
StyleDictionary.registerTransform({
  name: 'boxShadow/layer',
  type: 'value',
  transitive: true,
  transform: function(prop) {
    if (prop.type !== 'boxShadow') {
      return prop.value;
    }
    

    let boxShadowValue = prop.value || {};
    console.log(`Raw VALUE: ${JSON.stringify(boxShadowValue)}`);

    if (typeof boxShadowValue === 'string' && boxShadowValue.startsWith('BoxShadow')) {
      console.log(`Already formatted BoxShadow detected: ${boxShadowValue}`);
      return boxShadowValue;
    }
    
    const color = boxShadowValue.color || "color.black";
    const offsetX = boxShadowValue.x || "0";
    const offsetY = boxShadowValue.y || "0";
    const blurRadius = boxShadowValue.blur || "0";
    const spread = boxShadowValue.spread || "0";
    const type = boxShadowValue.type || "";

    
    const boxShadowData = 'BoxShadow(offsetX: CGFloat(' + offsetX + '), offsetY: CGFloat(' + offsetY + '), blurRadius: CGFloat(' + blurRadius + '), spread: CGFloat(' + spread + '), color: ' + createUIColorFromRGBA(color) + ', type: "' + type + '")';
    return boxShadowData;
  }
});

StyleDictionary.registerFormat({
    name: 'ios/swift/shadow',
    format: function({dictionary}) {
      const output = [
        '// Generated by Style Dictionary on ' + new Date().toISOString(),
        'import UIKit',
        '',
        'public struct BoxShadow: Sendable {',
        '  let color: UIColor',
        '  let offsetX: CGFloat',
        '  let offsetY: CGFloat',
        '  let blurRadius: CGFloat',
        '  let spread: CGFloat',
        '  let type: String? = nil',
        '}',
        '',
        'public struct BUIDesignSystemBoxShadow {',
      ];
  
      dictionary.allTokens
      .filter(token => token.type === 'boxShadow')
      .forEach(token => {
        const name = token.path.join('_').replace(/-/g, '_');
        output.push(`  public static let ${name} = ${token.value}`);
      });
  
      output.push('}');
      return output.join('\n');
    }
  });

StyleDictionary.registerFormat({
    name: 'ios/swift/BUIColors',
    format: function({dictionary}) {
      const output = [
        '// Generated by Style Dictionary on ' + new Date().toISOString(),
        'import UIKit',
        '',
        'public struct BUIDesignSystemColors {',
      ];
  
      dictionary.allTokens
      .filter(token => token.type === 'color')
      .forEach(token => {
        const name = token.path.join('_').replace(/-/g, '_');
        output.push(`  public static let ${name} = ${token.value}`);
      });
  
      output.push('}');
      return output.join('\n');
    }
  });



const isBorderOrRadius = {
    name: 'isBorderOrRadius',
    filter: async (token, options) => {
      return token.type === 'border' || token.type === 'borderRadius';
    },
  };

const isSpacingOrSizing = {
    name: 'isSpacingOrSizing',
    filter: async (token, options) => {
      return token.type === 'spacing' || token.type === 'sizing';
    },
  };

const isColorWithoutLinearGradient = {
    name: 'isColorWithoutLinearGradient',
    filter: async (token, options) => {
      return token.type === 'color' && !token.value.includes('linear-gradient');
    },
};
 

StyleDictionary.registerFilter(isBorderOrRadius);
StyleDictionary.registerFilter(isSpacingOrSizing);
StyleDictionary.registerFilter(isColorWithoutLinearGradient);

// Configure Style Dictionary
const myStyleDictionary = new StyleDictionary({
  "source": ["ComplexTokens/**/*.json"],
  "platforms": {
    "ios-swift": {
      "transformGroup": "ios-swift",
      "transforms": [
        "attribute/cti",
        "font/uifont",
        "border/layer",
        "percentage/opacity",
        "boxShadow/layer",
        "size/rem",
        "color/css"
      ],
      "buildPath": "BUIDesignSystemiOS/ios-swift/",
      "files": [
            {
            "destination": "MBDesignSystemFonts.swift",
            "format": "ios/swift/uifonts",
            "filter": {
                "type": "typography"
                }
            },
            {
                "destination": "MBDesignSystemColor.swift",
                "format": "ios/swift/BUIColors",
                "filter": "isColorWithoutLinearGradient"
            },
            {
                "destination": "MBDesignSystemBorders.swift",
                "format": "ios/swift/borderValues",
                "filter": 'isBorderOrRadius'
            },
            {
                "destination": "MBDesignSystemSpacing&Sizing.swift",
                "format": "ios-swift/enum.swift",
                "filter": 'isSpacingOrSizing',
                "options": {
                  "className": "MBDesignSystemSpacingSizing"
                }
            },
            {
                "destination": "MBDesignSystemShadows.swift",
                "format": "ios/swift/shadow",
                "filter": {
                    "type": "boxShadow"
                }
            },
            {
                "destination": "MBDesignSystemOpacity.swift",
                "format": "ios-swift/enum.swift",
                "filter": {
                    "type": "opacity"
                },
                "options": {
                  "className": "MBDesignSystemOpacity"
                }
            }
        ]
    }
    }
    });

// Build all platforms
myStyleDictionary.buildAllPlatforms();

console.log('Style Dictionary build completed!');

export default myStyleDictionary;
