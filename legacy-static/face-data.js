/**
 * face-data.js
 * 
 * Static indices and coordinate mappings for the MediaPipe 468-point Face Mesh.
 * These index groupings allow us to draw continuous closed paths for lips,
 * eyes, eyebrows, cheeks, and the face boundary.
 */

const FaceData = {
  // Lips landmarks (ordered sequentially to form closed polygons)
  lips: {
    // Outer boundary of the lips
    outer: [
      61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, // Upper lip outer (left to right)
      375, 321, 405, 314, 17, 84, 181, 91, 146, 61     // Lower lip outer (right to left)
    ],
    // Inner boundary of the lips (the mouth opening)
    inner: [
      78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, // Upper lip inner (left to right)
      324, 318, 402, 317, 14, 87, 178, 88, 95, 78       // Lower lip inner (right to left)
    ],
    // Top lip outer (for separate shading if needed)
    upperOuter: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 308, 415, 310, 311, 312, 13, 82, 81, 42, 183, 78, 61],
    // Bottom lip outer (for separate shading if needed)
    lowerOuter: [291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61, 78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 291]
  },

  // Eyes landmarks (ordered sequentially)
  eyes: {
    // Right Eye (viewer's left, user's right)
    right: {
      outline: [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7, 33],
      upperLash: [33, 246, 161, 160, 159, 158, 157, 173, 133],
      lowerLash: [133, 155, 154, 153, 145, 144, 163, 7, 33],
      pupil: 468, // (Requires refineLandmarks)
      iris: [469, 470, 471, 472]
    },
    // Left Eye (viewer's right, user's left)
    left: {
      outline: [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382, 362],
      upperLash: [362, 398, 384, 385, 386, 387, 388, 466, 263],
      lowerLash: [263, 249, 390, 373, 374, 380, 381, 382, 362],
      pupil: 473, // (Requires refineLandmarks)
      iris: [474, 475, 476, 477]
    }
  },

  // Eyebrows landmarks (ordered from inner to outer edge)
  eyebrows: {
    right: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
    left: [300, 293, 334, 296, 336, 285, 295, 282, 283, 276]
  },

  // Face Silhouette / Jawline (ordered counter-clockwise)
  faceOutline: [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 
    400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 
    54, 103, 67, 109, 10
  ],

  // Specific landmarks for cheeks
  cheeks: {
    rightCenter: 117, // Center of right cheek bone
    leftCenter: 346,  // Center of left cheek bone
    rightOuter: 127,  // Outer right cheekbone edge
    leftOuter: 356,   // Outer left cheekbone edge
    rightInner: 205,  // Inner right cheek edge (near nose/mouth)
    leftInner: 425    // Inner left cheek edge (near nose/mouth)
  },

  // Specific landmarks for contour & highlight placement
  contour: {
    rightCheekbone: [127, 226, 117, 205],
    leftCheekbone: [356, 446, 346, 425],
    jawlineRight: [172, 136, 150, 149, 176, 148, 152],
    jawlineLeft: [152, 377, 400, 378, 379, 365, 397],
    foreheadRight: [103, 67, 109, 10],
    foreheadLeft: [10, 338, 297, 332]
  },

  // Specific landmarks for nose, forehead, and chin highlighting
  highlight: {
    noseBridge: [168, 6, 197, 195, 5, 4], // From forehead junction to nose tip
    noseTip: 4,
    foreheadCenter: 151,
    chinCenter: 152
  },

  // Hair boundaries (simplified landmarks along the hairline)
  hairline: [
    109, 10, 338, 297, 332, 284, 251, 389, 356, 454,
    // Mirrored right side
    127, 234, 93, 132, 58, 172, 136, 150
  ],

  // Helper function to detect face shape based on landmark ratios
  detectFaceShape: (landmarks) => {
    if (!landmarks || landmarks.length < 468) return "oval";

    const getDistance = (p1, p2) => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dz = p1.z - p2.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    // Landmark references:
    // 10: Forehead top center
    // 152: Chin center
    // 234: Right cheekbone outer edge
    // 454: Left cheekbone outer edge
    // 58: Right jaw point
    // 288: Left jaw point
    // 103: Right forehead edge
    // 332: Left forehead edge

    const faceLength = getDistance(landmarks[10], landmarks[152]);
    const cheekboneWidth = getDistance(landmarks[234], landmarks[454]);
    const jawWidth = getDistance(landmarks[58], landmarks[288]);
    const foreheadWidth = getDistance(landmarks[103], landmarks[332]);

    const lengthToWidthRatio = faceLength / cheekboneWidth;
    const jawToCheekRatio = jawWidth / cheekboneWidth;
    const foreheadToCheekRatio = foreheadWidth / cheekboneWidth;

    if (lengthToWidthRatio > 1.3) {
      return "long";
    } else if (jawToCheekRatio > 0.85) {
      return "square";
    } else if (foreheadToCheekRatio > 0.85 && jawToCheekRatio < 0.65) {
      return "heart";
    } else if (foreheadToCheekRatio < 0.7 && jawToCheekRatio < 0.7) {
      return "diamond";
    } else if (lengthToWidthRatio < 1.15) {
      return "round";
    } else {
      return "oval";
    }
  }
};

// Export if running in a module context, otherwise expose globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FaceData;
} else {
  window.FaceData = FaceData;
}
