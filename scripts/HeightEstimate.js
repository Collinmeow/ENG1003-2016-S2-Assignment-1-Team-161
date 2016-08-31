// ENG1003 2016 S2 Assignment 1
// Group: Team 161
// Group members:
// Lee Yong Jieh        27736105 (yjlee37)
// Bryan Chan Chun Yen  27031039 (bccha4)
// Chin Zhi Hui         27586073 (zhchi3)
// Marjan Ferdaus       27361748 (mfer32)


// The CameraVideoPageController is a class that controls the camera 
// video page.  This class provides a some useful methods you will
// need to call:
//     cameraVideoPage.displayMessage(message, timeout):
//         Causes a short message string to be displayed on the
//         page for a brief period.  Useful for showing quick
//         notifications to the user.  message is a plain string.
//         timeout is option and denotes the length of time in msec
//         to show the message for.
//     cameraVideoPage.setHeadsUpDisplayHTML(html):
//         This will set or update the heads-up-display with the
//         text given in the html argument.  Usually this should 
//         just be a string with text and line breaks (<br />).

// Initialise the camera video page and callback to our 
// cameraVideoPageInitialised() function when ready.
var cameraVideoPage = new CameraVideoPageController(
        cameraVideoPageInitialised);

// Creating variables to store state.
var avg;
var baseAngle;
var camHeight;
var apexAngle;
var distanceEstimate;
    
// This function will be called when the camera video page
// is intialised and ready to be used.
function cameraVideoPageInitialised()
{
    // Declaring variables to be used in Step 1 and Step 2
    var array = new Array(10).fill(0);          // Declaring an array and initialise (fill) with 0
    var i=0;                                    // Declaring and initializing index counter for array
	var output;                                 // Declaring output message string
	var sum=0;                                  // Declaring and initializing sum=0 for calculating average
	avg = 0;                                    // Initializing average to 0
    
    // Step 1: Check for and intialise deviceMotion
    window.addEventListener("deviceorientation", handleOrientation, true);  //[1]

    //Callback function to be run when device orientation data is passed
    function handleOrientation(event) {                                     //[1]
        
        // Getting angle (beta value) from parameter object and store into beta variable
        var beta = event.beta;
        
        
        // Step 2: Smoothing sensor data
        
        // Storing beta values into array 
        array[i]=beta;
        i++;
        
        // Perform smoothing (averaging) when array is filled
        if (i=== array.length)
            {
                // Resetting average and sum values before calculating average
				avg = 0;
				sum = 0;
                
                //averaging values
                for (var j = 0;j<array.length;j++)
                    {
                        sum+=array[j];
                    }
                avg=sum/array.length;
                
                // Reset data array and index counter for next round
                i=0;
                array.fill(0);
            }
        
        
        // Output angle (beta values) and smoothed angle (average beta) to screen
        //output="beta: " + beta.toFixed(1) + "<br />" + "i: " + i + "<br />" + "beta avg: " + avg.toFixed(1) + "<br />";
        output="beta: " + beta.toFixed(1) + "<br />" + "beta average: " + avg.toFixed(0) + "<br />";
        cameraVideoPage.setHeadsUpDisplayHTML(output);

    }
	
	
}

    
// This function is called by a button to set the height of phone from the
// ground, in metres.
function setCameraHeightValue()
{
    // Step 3: Set camera height
    
    // Prompt user for estimated height of camera
    var heightEstimate = prompt("Please input estimated height of phone to ground in metres");
    
    // Check for invalid inputs such as
    // 1. No input at all
    // 2. Input less than zero (negative) or input greater than 3
    // 3. Input is not a number (NaN)
    // 4. Input is alphanumeric or alphabets
    
    if (heightEstimate == null)
    {
        // if user press cancel when set cam height
        // do nothing
    }
    else if(heightEstimate === "" || heightEstimate <= 0 || heightEstimate >= 3 || isNaN(heightEstimate) === true) 
    {
        // alert user of invalid input
        alert("please input legit value");
    }
    else
            {
                //store height estimate value to camera height value
                camHeight = heightEstimate;
                
                // Display estimated height of camera
                cameraVideoPage.displayMessage("Estimated height of camera is: " + camHeight + " metres", 2000);
                
                // Check if camera height is updated after estimated distance is already calculated at least once
                checkValues();
            } 
    
}
    
    
// This function is called by a button to set the angle to the base of
// the object being measured.  It uses the current smoothed tilt angle.
function setBaseTiltAngle()
{
    // Step 4: Record tilt angle
    
    // Declaring conversion factor
    var DEGREE_TO_RAD=Math.PI/180;
    
    // Declaring other intermediate variables
    var baseAngleRad;
	
    
    
    // If camera height is not set, alert user
    // If base angle does not make logical sense, alert user
    // If it is set, calculate distance to object
    if (camHeight === undefined)
    {
        alert("Please set cam height first");
    }
    else if (avg<=0)
    {
        alert("Please do not hold your phone upside down or stand on the object you are measuring");
    }
    else if (avg>=90)
    {
        alert("Invalid base angle");
    }
    else
    {
        // Save current average beta value as base angle value
	    baseAngle=avg;
        
        // Step 5: Calculate estimated distance to object using trigonometry
    
        // Converting base angle to radians
        baseAngleRad = baseAngle*DEGREE_TO_RAD;

        // Estimate distance to object using trigonometry
        distanceEstimate = camHeight*(Math.tan(baseAngleRad));

        // Display estimated distance
        cameraVideoPage.displayMessage("Estimated distance to object is: " + distanceEstimate.toFixed(1) + " metres", 2000);
        
        // Check if base angle is updated after estimated distance is already calculated at least once
        checkValues();
    }
    
    
}

// This function is called by a button to set the angle to the apex of
// the object being measured.  It uses the current smoothed tilt angle.
function setApexTiltAngle()
{
    // Step 4: Record tilt angle 
    
    // If camera height and/or base angle is not set, alert user
    // If apex angle does not make logical sense, alert user
    // If it is set, calculate distance to object
    if (camHeight === undefined)
    {
        alert("Please set cam height first");
    }
    else if (baseAngle === undefined)
    {
        alert("Please set base first");
    }
    else if (avg<baseAngle)
    {
        alert("Apex angle is less than base angle, does not make sense. Please input base angle or apex angle again");
    }
    else
    {
        // Save current average beta value as apex angle value
        apexAngle = avg;
        estimateHeight();
    }
	
}	

// This function is called by setApexTiltAngle or checkValues
// to estimate height of object using
// apexAngle, camHeight and distanceEstimate
function estimateHeight()
{
    // Declaring conversion factor
    var DEGREE_TO_RAD=Math.PI/180;
	
    // Declaring other intermediate variables
    var apexAngleRad;
    var objectHeightEstimate;
    
    // Step 6: Calculate estimated height of object using trigonometry

    // Converting base angle to radians
    apexAngleRad = apexAngle*DEGREE_TO_RAD;

    // Estimate height of object using trigonometry
    objectHeightEstimate = Number(distanceEstimate*(Math.tan(apexAngleRad-Math.PI/2)))+Number(camHeight);

    // Display estimated distance
    //alert("Estimated height of object is: " + objectHeightEstimate.toFixed(1) + " metres");
    cameraVideoPage.displayMessage("Estimated height of object is: " + objectHeightEstimate.toFixed(1) + "metres", 5000);
}

// This function is called by setBaseTiltAngle or setApexTiltAngle
// to check if base angle or apex angle values are updated
// after estimated distance is already calculated at least once
// If true, reestimate height again
function checkValues()
{
    if (camHeight!=undefined && baseAngle!=undefined && apexAngle!=undefined)
    {
        if (apexAngle<baseAngle)
        {
            alert("Apex angle is less than base angle, does not make sense. Please input base angle or apex angle again");
        }
        else
        {
            estimateHeight();    
        }
        
    }
}


// References
// [1]"Detecting device orientation", Mozilla Developer Network, 2016. [Online]. Available: https://developer.mozilla.org/en-US/docs/Web/API/Detecting_device_orientation. [Accessed: 25- Aug- 2016].


