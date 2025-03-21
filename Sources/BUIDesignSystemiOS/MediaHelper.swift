//
//  MediaHelper.swift
//  BUIDesignSystemiOS
//
//  Created by VILLAHERMOSA SEBASTIAN on 21/03/2025.
//

import UIKit

public struct MediaHelper {
    public static func imageFromPackage(named imageName: String) -> UIImage? {
        return UIImage(named: imageName, in: .main, compatibleWith: nil)
    }
}
