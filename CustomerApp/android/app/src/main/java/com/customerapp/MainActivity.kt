package com.customerapp

// 1. We need to add this import statement for the 'Bundle' class.
import android.os.Bundle;
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "CustomerApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  // --- THIS IS THE NEW CODE BLOCK TO ADD ---
  // This is the Kotlin equivalent of the Java code. It's required for
  // react-native-screens to work correctly on Android.
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}
