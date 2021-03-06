class GCamera {

    static setCamera(cam) {
        GCamera.cam = cam;
    }

    /** Sets the x position on the map */
    static setXPos(xPos) {
        GCamera.cam.position.x = xPos;
    }

    /** Sets the y position on the map */
    static setZPos(zPos) {
        GCamera.cam.position.z = zPos;
    }

    /** Sets the height above the map */
    static setYPos(yPos) {
        GCamera.cam.position.y = yPos;
    }


    /******** MOUSE CONTROLED CAMERA *********/
    static orbitateAroundPosition(_marker, radius) {
        // Angle on XZ plane
        let angle = Utils.p5.map(Utils.mouseX, 0, window.innerWidth, 0, Math.PI * 2);
        // Calculate height
        let pY = Utils.p5.map(Utils.mouseY, 0, window.innerHeight, 0, GCamera.zoomLevel);
        // Calculate target to angle direction 
        let pX = _marker.mesh.position.x + (Math.cos(angle) * pY);
        let pZ = _marker.mesh.position.z + (Math.sin(angle) * pY);

        // Set camera height
        GCamera.cam.lookAt(new THREE.Vector3(pX, pY, pZ));
    }


    /******** GYROSCOPE CONTROLED CAMERA *********/
    static lookingFrom(centerX, centerZ, frustrumDepth) {

        let oPosY;
        // determines the angle rotating over X axis. This determines when the horizon is visible when the phone is tilted forwards or backwards
        if (Utils.p5.rotationX < 0) {
            oPosY = 0;
        } else if (Utils.p5.rotationX >= 0 && Utils.p5.rotationX <= 90) {
            oPosY = Utils.p5.map(Utils.p5.rotationX, 0, 90, 0, 100);
        } else if (Utils.p5.rotationX > 90) {
            oPosY = 70;
        }

        // This adapts the zoom level at each iteration of the main interval
        if (GCamera.cameraMode == "Adaptive height") {
            let maxDistance = 50000;
            let distanceToGhost = cyclist.mesh.position.distanceToSquared(ghost.mesh.position);
            if (distanceToGhost > maxDistance) {
                distanceToGhost = maxDistance;
            }
            let newZoomLevel = Utils.p5.map(distanceToGhost, 0, maxDistance, 150, GCamera.maxZoom);
            GCamera.zoomLevel = newZoomLevel;
        }

        GCamera.setYPos(GCamera.zoomLevel);

        // **** NOTES *****
        // The position of 0 degrees is not consistent across browsers. 
        // Android: WEST(270), iOS: EAST(90), Opera:NORTH(0), FirefoxMobile: NORTH(0), Chrome Android: WEST(270)
        // Source:  https://mobiforge.com/design-development/html5-mobile-web-device-orientation-events
        // Potential solution: https://github.com/ajfisher/deviceapi-normaliser

        let angle = Utils.p5.radians(270 - Utils.p5.rotationZ);
        //GUI.error.textContent = Utils.p5.rotationZ;
        let oPosX = centerX + Math.cos(angle) * frustrumDepth;
        let oPosZ = centerZ + Math.sin(angle) * frustrumDepth;

        GCamera.cam.lookAt(new THREE.Vector3(oPosX, oPosY, oPosZ));
    }


    static switchMobileCamera() {
        switch (GCamera.cameraMode) {
            case "Top view":
                GCamera.cameraMode = "First-person";
                GCamera.zoomLevel = 100;
                break;
            case "First-person":
                GCamera.cameraMode = "Adaptive height";
                break;
            case "Adaptive height":
                GCamera.cameraMode = "Top view";
                GCamera.zoomLevel = 1000;
                break;
        }
        GUI.cameraButton.textContent = GCamera.cameraMode;
    }
}
// The camera instance
GCamera.cam = undefined;
//
GCamera.cameraMode = "First-person";
// Current zoom level
GCamera.zoomLevel = 1;
// Max zoom level. How high the camera can be above the ground
GCamera.maxZoom = 2800;