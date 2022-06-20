import React, { useContext, useEffect, useState } from "react";
import nina from "@nina-protocol/nina-sdk";
import "react-dropzone-uploader/dist/styles.css";
import Dropzone from "react-dropzone-uploader";
import { Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import Image from "next/image";

const { NinaContext } = nina.contexts;

const HubImageDropzone = ({ type, setArtwork, currentImageUrl, update }) => {
  const handleChangeStatus = ({ meta, file, remove }, status) => {
    if (type === "artwork") {
      if (status === "removed") {
        setArtwork(undefined);
      } else {
        setArtwork({
          file,
          meta,
        });
      }
    }
  };

  const inputLayout = (type) => {
    return (
      <>
        <AddOutlinedIcon />
      </>
    );
  };

  const Preview = ({ meta, fileWithMeta }) => {
    if (meta.type.includes("image") && meta.previewUrl) {
      return (
        <Box style={previewBoxStyles}>
          {cancelIcon(fileWithMeta.remove)}
          <Image src={meta.previewUrl} layout="fill" alt="preview" />
        </Box>
      );
    } else {
      return null;
    }
  };

  const previewBoxStyles = {
    position: "relative",
    width: "100%",
    flexDirection: "column",
    color: "white",
  };

  const cancelIcon = (remove) => (
    <ClearOutlinedIcon
      onClick={remove}
      style={{
        position: "absolute",
        top: "15px",
        left: "10px",
        color: "white",
        zIndex: "10",
      }}
    />
  );

  return (
    <Root>
      <Dropzone
        onChangeStatus={handleChangeStatus}
        accept={"image/*"}
        maxFiles={1}
        SubmitButtonComponent={null}
        autoUpload={false}
        canRestart={false}
        classNames={{
          dropzone: classes.dropZone,
          inputLabel: classes.dropZoneInputLabel,
          preview: classes.dropZonePreviewWrapper,
          previewStatusContainer: classes.dropZonePreviewStatusContainer,
        }}
        inputContent={inputLayout(type)}
        PreviewComponent={Preview}
        styles={{
          dropzone: {
            minHeight: 60,
            display: "flex",
            justifyContent: "center",
            minWidth: "100px",
            width: "auto",
            height: "100px",
            cursor: "pointer",
            marginBottom: "15px",
            boxShadow: "inset 0px 0px 30px 0px #0000001A",
            backgroundColor: "#EAEAEA",
            backgroundImage: update ? `url("${currentImageUrl}")` : "",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
          },
          preview: {
            margin: "auto",
            alignItems: "center",
          },
          previewImage: {
            width: "100%",
            maxHeight: "100%",
            maxWidth: "unset",
          },
          inputLabel: {
            cursor: "pointer",
            textAlign: "left",
            padding: "15px",
            margin: "auto",
          },
        }}
      />

      <Copy>
        <Typography variant="body1">Upload Hub Logo Image</Typography>
        <Typography variant="subtitle1">File Formats: JPG, PNG</Typography>

        {update && (
          <Typography variant="subtitle1">
            Click current image to replace hub image
          </Typography>
        )}
      </Copy>
    </Root>
  );
};

const PREFIX = "MediaDropzone";

const classes = {
  dropZone: `${PREFIX}-dropZone`,
  dropZoneInputLabel: `${PREFIX}-dropZoneInputLabel`,
  dropZonePreviewWrapper: `${PREFIX}-dropZonePreviewWrapper`,
  dropZonePreviewStatusContainer: `${PREFIX}-dropZonePreviewStatusContainer`,
};

const Root = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
}));

const Copy = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  // alignItems: 'center',
  textAlign: "left",
  paddingLeft: "15px",
  "& p": {
    color: "rgba(0,0,0, 0.6) !important",
    fontSize: "14px !important",
    textTransform: "uppercase",
  },
}));

export default HubImageDropzone;
