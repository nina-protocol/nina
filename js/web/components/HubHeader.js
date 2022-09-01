import { Toolbar } from "@mui/material";
import Image from "next/image";
import { styled } from '@mui/material/styles'
import {Typography} from "@mui/material";
import { imageManager } from "@nina-protocol/nina-internal-sdk/src/utils";

const { getImageFromCDN, loader } = imageManager

const HubHeader = ({hubImage, hubName, hubDescription, hubUrl, hubDate}) => {
    console.log('hubDate', new Date(Date.parse(hubDate)))
    console.log('hubImage', hubImage)
    return (
        <Toolbar>
            <Image
            height={350}
            width={350}
            layout="responsive"
            src={getImageFromCDN(hubImage, 400, new Date(Date.parse(hubDate)))}
            alt={hubName}
            priority={true}
            loader={loader}
          />
            <Typography align="left">{hubName}</Typography>
            <Typography align="center">{hubDescription}</Typography>
            <Typography align="right">{hubUrl}</Typography>
        </Toolbar>
    );
}

export default HubHeader;