import { useContext, useState } from "react";
import { useSnackbar } from "notistack";
import nina from "@nina-protocol/nina-sdk";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { styled } from "@mui/material/styles";

import { useFormik } from "formik";
const { HubContext } = nina.contexts;
import { DashboardHeader } from "../styles/theme/lightThemeOptions.js";

const CollaboratorPermissions = (props) => {
  const { hubPubkey, activeSelection, isAuthority, setActiveSelection } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { hubUpdateCollaboratorPermission } = useContext(HubContext);
  const [unlimitedAllowance, setUnlimitAllowance] = useState(
    activeSelection.allowance === -1
  );

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
      collaboratorPubkey: activeSelection.collaborator,
      canAddContent: activeSelection.canAddContent,
      canAddCollaborator: activeSelection.canAddCollaborator,
      allowance: activeSelection.allowance,
      hubPubkey,
    },
    onSubmit: async (values, { resetForm }) => {
      const {
        collaboratorPubkey,
        hubPubkey,
        canAddContent,
        canAddCollaborator,
        allowance,
      } = values;
      const result = await hubUpdateCollaboratorPermission(
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
        resetForm();
      } else {
        enqueueSnackbar("Artist Not Added", {
          variant: "failure",
        });
      }
    },
    enableReinitialize: true,
  });

  return (
    <Root mt={2}>
      {!activeSelection && (
        <DashboardHeader fontWeight={600}>
          Collaborator Permissions
        </DashboardHeader>
      )}

      {activeSelection && (
        <form
          onSubmit={formik.handleSubmit}
          style={{ display: "flex", flexDirection: "column", width: "100%" }}
        >
          <TextField
            fullWidth
            id="collaboratorPubkey"
            name="collaboratorPubkey"
            // label="Collaborator"
            value={formik.values.collaboratorPubkey}
            onChange={formik.handleChange}
            variant="standard"
            disabled={true}
          />
          <Box
            display={"flex"}
            alignItems="flex-end"
            justifyContent={"flex-start"}
            sx={{ margin: " 15px 0px 0", padding: "0" }}
          >
            <FormControlLabel
              sx={{ margin: "0", padding: "0" }}
              control={
                <Checkbox
                  checked={formik.values.canAddContent}
                  id="canAddContent"
                  onChange={formik.handleChange}
                  padding="0px !important"
                />
              }
              label="Can Add Content"
            />
            <FormControlLabel
              sx={{ margin: "0", paddingLeft: "15px" }}
              control={
                <Checkbox
                  checked={formik.values.canAddCollaborator}
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
                label="Allowance"
                name="allowance"
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
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
                  id="allowance"
                  onChange={() => toggleAllowance(formik)}
                  padding="0px !important"
                  defaultChecked={unlimitedAllowance}
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
            disabled={!isAuthority}
          >
            {isAuthority
              ? "Update Permissions"
              : "You Do Not Have Permission To Add Artists"}
          </Button>
          <Button
            style={{ marginTop: "15px" }}
            variant="outlined"
            fullWidth
            onClick={() => {
              setActiveSelection(null);
            }}
          >
            Cancel
          </Button>
        </form>
      )}
    </Root>
  );
};

const Root = styled(Box)(() => ({
  "& .MuiFormControlLabel-label": {
    fontSize: "13px !important",
    whiteSpace: "nowrap",
  },
}));

export default CollaboratorPermissions;
