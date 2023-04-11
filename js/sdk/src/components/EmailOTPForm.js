import React, { useState } from "react";
import {MuiOtpInput} from 'mui-one-time-password-input'
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {styled} from '@mui/material/styles'


export default function EmailOTP({ login }) {
  const [passcode, setPasscode] = useState("");
  const [retries, setRetries] = useState(2);
  const [message, setMessage] = useState();
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await autoSubmit(passcode);

    setDisabled(true);
    setRetries((r) => r - 1);
    // setPasscode("");

    // Send OTP for verification
    login.emit("verify-email-otp", passcode);

    login.on("invalid-email-otp", () => {
      // User entered invalid OTP
      setDisabled(false);

      if (!retries) {
        setMessage("No more retries. Please try again later.");

        // Cancel the login
        login.emit("cancel");
      } else {
        // Prompt the user again for the OTP
        setMessage(
          `Incorrect code. Please enter OTP again. ${retries} ${
            retries === 1 ? "retry" : "retries"
          } left.`
        );
      }
    });
  };

  // const autoSubmit = async (value) => {
  //   setDisabled(true);
  //   setRetries((r) => r - 1);
  //   // setPasscode("");

  //   // Send OTP for verification
  //   login.emit("verify-email-otp", passcode);

  //   login.on("invalid-email-otp", () => {
  //     // User entered invalid OTP
  //     setDisabled(false);

  //     if (!retries) {
  //       setMessage("No more retries. Please try again later.");

  //       // Cancel the login
  //       login.emit("cancel");
  //     } else {
  //       // Prompt the user again for the OTP
  //       setMessage(
  //         `Incorrect code. Please enter OTP again. ${retries} ${retries === 1 ? "retry" : "retries"
  //         } left.`
  //       );
  //     }
  //   });
  // };


  const handleChange = (value) => {
    console.log('value :>> ', value);
    setPasscode(value);
    console.log('passcode :>> ', passcode);
  }
 
  const handleCancel = () => {
    login.emit("cancel");
    setDisabled(false);
    console.log("%cUser canceled login.", "color: orange");
  };

  return (
    <div id="otp-component">
      <h3>enter one-time passcode</h3>
      {message && <div id="otp-message">{message}</div>}


      <form onSubmit={handleSubmit}>
      <MuiOtpInput 
        value={passcode} 
        length={6} 
        onChange={(e) => handleChange(e)} 
        TextFieldsProps={{type: 'number'}}
        type="number"
        />
        <Ctas sx={{my: 1}}>
          <Button id="submit-otp" type="submit" variant='outlined' disabled={disabled} style={{marginBottom: '15px'}} >
            Submit
          </Button>
          <Button id="cancel-otp" onClick={handleCancel} variant='outlined' disabled={disabled}>
            Cancel
          </Button>
        </Ctas>
      </form>
    </div>
  );
}

const Ctas = styled(Box)(({theme}) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
})) 