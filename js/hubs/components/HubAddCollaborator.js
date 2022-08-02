import React, { useContext, useState } from "react";
import { useSnackbar } from "notistack";
import Hub from "@nina-protocol/nina-sdk/esm/Hub";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { DashboardHeader } from "../styles/theme/lightThemeOptions.js";

import { useFormik } from "formik";

const HubAddCollaborator = (props) => {
  const { hubPubkey, canAddCollaborators } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { hubAddCollaborator } = useContext(Hub.Context);
  const [unlimitedAllowance, setUnlimitAllowance] = useState(false);

  // const IconWithTooltip = () => {
  //   return (
  //     <Tooltip title={`Allowance sets the amount of actions a collaborator can execute, like publishing releases or creating posts`}>
  //       <HelpIcon sx={{fontSize: '16px !important', marginLeft: '5px'}} />
  //     </Tooltip>
  //   )
  // }

  const toggleAllowance = (formik) => {
    if (unlimitedAllowance) {
      setUnlimitAllowance(false);
      formik.setFieldValue("allowance", 3);
    } else {
      setUnlimitAllowance(true);
      formik.setFieldValue("allowance", -1);
    }
  };

  const formik = useFormik({
    initialValues: {
      collaboratorPubkey: "",
      canAddContent: true,
      canAddCollaborator: true,
      allowance: 3,
    },
    onSubmit: async (values, { resetForm }) => {
      const {
        collaboratorPubkey,
        canAddContent,
        canAddCollaborator,
        allowance,
      } = values;
      const result = await hubAddCollaborator(
        collaboratorPubkey,
        hubPubkey,
        canAddContent,
        canAddCollaborator,
        allowance
      );
      if (result.success) {
        enqueueSnackbar(result.msg, {
          variant: "info",
        });
      } else {
        enqueueSnackbar("Collaborator Not Added", {
          variant: "failure",
        });
      }
      resetForm();
    },
  });

  return (
    <Root>
      <DashboardHeader fontWeight={600}>
        Add an Collaborator to your hub via their wallet address
      </DashboardHeader>

      <form
        onSubmit={formik.handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          marginTop: "16px",
        }}
      >
        <TextField
          fullWidth
          id="collaboratorPubkey"
          name="collaboratorPubkey"
          label="Collaborator"
          value={formik.values.collaboratorPubkey}
          onChange={formik.handleChange}
          variant="standard"
          disabled={!canAddCollaborators}
        />

        <Box
          display={"flex"}
          alignItems="flex-end"
          sx={{ margin: " 15px 0px 0", padding: "0" }}
        >
          <FormControlLabel
            sx={{ margin: "0", padding: "0" }}
            control={
              <Checkbox
                value={formik.values.canAddContent}
                id="canAddContent"
                onChange={formik.handleChange}
                defaultChecked
                padding="0px !important"
              />
            }
            label="Can Add Content"
          />
          <FormControlLabel
            sx={{ margin: "0", paddingLeft: "15px" }}
            control={
              <Checkbox
                value={formik.values.canAddCollaborator}
                id="canAddCollaborator"
                onChange={formik.handleChange}
                padding="0px !important"
              />
            }
            label="Can Add Collaborators"
          />

          <Box>
            <TextField
              id="allowance"
              label={
                <Box display="flex" alignItems="center">
                  {"Allowance"}
                </Box>
              }
              name="allowance"
              type="number"
              variant="standard"
              style={{ width: "100px", marginLeft: "15px", fontSize: "13px" }}
              value={unlimitedAllowance ? "" : formik.values.allowance}
              onChange={formik.handleChange}
              disabled={unlimitedAllowance}
            />
          </Box>

          <FormControlLabel
            sx={{ margin: "0", paddingLeft: "15px" }}
            control={
              <Checkbox
                value={formik.values.canAddCollaborator}
                id="canAddCollaborator"
                onChange={(e) => toggleAllowance(formik)}
                padding="0px !important"
              />
            }
            label="Unlimited"
          />
        </Box>

        <Button
          style={{ marginTop: "15px" }}
          variant="outlined"
          fullWidth
          type="submit"
          disabled={!canAddCollaborators}
        >
          {canAddCollaborators
            ? "Add Collaborator"
            : "You Do Not Have Permission To Add Collaborators"}
        </Button>
      </form>
    </Root>
  );
};

const Root = styled(Box)(({ theme }) => ({
  // whiteSpace: 'nowrap',
  "& .MuiFormControlLabel-label": {
    fontSize: "13px !important",
  },
}));

export default HubAddCollaborator;
