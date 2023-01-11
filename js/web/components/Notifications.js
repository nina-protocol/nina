import React, { useState } from 'react';


const Notifcations = (props) => {
  //if localstrage does not have last seen signature, prompt wallet siugn message
  const [lastSeenSignature, setLastSeenSignature] = useState(localStorage.getItem('nina-last-seen-signature'))

  console.log('lastSeenSignature :>> ', lastSeenSignature);

  return (
    <div>
      <h1>Im the notifciations</h1>
    </div>  
  );
}

export default Notifcations;