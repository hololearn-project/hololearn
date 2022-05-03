/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */

class VRButton {
  static createButton( renderer, options ) {
    if ( options ) {
      console.error( 'THREE.VRButton: The "options" parameter has been removed. ' +
      'Please set the reference space type via renderer.xr.setReferenceSpaceType() instead.' );
    }

    const button = document.createElement( 'button' );

    function showEnterVR( /* device*/ ) {
      let currentSession = null;
      console.log('Showing the button');

      async function onSessionStarted( session ) {
        console.log('in VR');
        session.addEventListener( 'end', onSessionEnded );
        console.log('setting session');
        await renderer.xr.setSession( session );
        console.log('session set!');
        button.textContent = 'EXIT VR';

        currentSession = session;
        inVR = true;

        // set the scale for VR
        scene.scale.set(0.2, 0.2, 0.2);

        // camera.lookAt(0, 0, 0);
        console.log('Moving shit to VR');
        moveSceneToVR();
        console.log('Done moving');
        renderer.render(scene, camera);
        console.log('renderer.render called');
      }

      async function onSessionRejected() {
        console.log('FUUUCCKKK WE ARE REJECTED');
      }

      async function onSessionEnded( /* event*/ ) {
        currentSession.removeEventListener( 'end', onSessionEnded );

        button.textContent = 'ENTER VR';

        inVR = false;

        currentSession = null;
        console.log('session has ended');

        // set the scale for non-VR
        scene.scale.set(1, 1, 1);
        moveSceneFromVR();
      }


      button.style.display = '';

      button.style.cursor = 'pointer';
      button.style.left = 'calc(50% - 50px)';
      button.style.width = '100px';

      button.textContent = 'ENTER VR';

      button.onmouseenter = function() {
        button.style.opacity = '1.0';
      };

      button.onmouseleave = function() {
        button.style.opacity = '0.5';
      };

      button.onclick = function() {
        console.log('button clicked');
        console.log('button clicked');
        if ( currentSession === null ) {
          // WebXR's requestReferenceSpace only works if the corresponding feature
          // was requested at session creation time. For simplicity, just ask for
          // the interesting ones as optional features, but be aware that the
          // requestReferenceSpace call will fail if it turns out to be unavailable.
          // ('local' is always available for immersive sessions and doesn't need to
          // be requested separately.)

          const sessionInit = {optionalFeatures: []};
          if (navigator.xr.isSessionSupported( 'immersive-vr' )) {
            console.log('session IS supported');
          } else {
            console.log('session is NOT supported');
          }
          console.log('requesting session');
          navigator.xr.requestSession( 'immersive-vr').then( onSessionStarted ).catch(onSessionRejected);
          console.log('session is requested');
        } else {
          console.log('something is null');
          currentSession.end();
        }
      };
    }

    function disableButton() {
      button.style.display = '';

      button.style.cursor = 'auto';
      button.style.left = 'calc(50% - 75px)';
      button.style.width = '150px';

      button.onmouseenter = null;
      button.onmouseleave = null;

      button.onclick = null;
    }

    function showWebXRNotFound() {
      disableButton();

      button.textContent = 'VR NOT SUPPORTED';
    }

    function stylizeElement( element ) {
      element.style.position = 'absolute';
      element.style.bottom = '20px';
      element.style.padding = '12px 6px';
      element.style.border = '1px solid #fff';
      element.style.borderRadius = '4px';
      element.style.background = 'rgba(0,0,0,0.1)';
      element.style.color = '#fff';
      element.style.font = 'normal 13px sans-serif';
      element.style.textAlign = 'center';
      element.style.opacity = '0.5';
      element.style.outline = 'none';
      element.style.zIndex = '999';
    }

    if ( 'xr' in navigator ) {
      button.id = 'VRButton';
      button.style.display = 'none';

      stylizeElement( button );

      navigator.xr.isSessionSupported( 'immersive-vr' ).then( function( supported ) {
        supported ? showEnterVR() : showWebXRNotFound();
        console.log('we now if it is supported or not');
      } );

      return button;
    } else {
      const message = document.createElement( 'a' );

      if ( window.isSecureContext === false ) {
        message.href = document.location.href.replace( /^http:/, 'https:' );
        message.innerHTML = 'WEBXR NEEDS HTTPS'; // TODO Improve message
      } else {
        message.href = 'https://immersiveweb.dev/';
        message.innerHTML = 'WEBXR NOT AVAILABLE';
      }

      message.style.left = 'calc(50% - 90px)';
      message.style.width = '180px';
      message.style.textDecoration = 'none';

      stylizeElement( message );

      return message;
    }
  }
}
