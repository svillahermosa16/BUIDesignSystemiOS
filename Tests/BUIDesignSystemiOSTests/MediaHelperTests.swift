//
//  MediaHelperTests.swift
//  BUIDesignSystemiOS
//
//  Created by VILLAHERMOSA SEBASTIAN on 21/03/2025.
//


import XCTest
@testable import BUIDesignSystemiOS

final class MediaHelperTests: XCTestCase {

    func testImageFromPackage() {
        // Assuming "exampleImage" is the name of an image in Media.xcassets
        let imageName = "exampleImage"
        
        // Attempt to load the image
        let image = MediaHelper.imageFromPackage(named: imageName)
        
        // Verify the image is not nil
        XCTAssertNotNil(image, "Image \(imageName) should not be nil")
    }
}