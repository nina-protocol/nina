const UPLOAD_TYPE_ARTWORK = "UPLOAD_TYPE_ARTWORK";
const UPLOAD_TYPE_TRACK = "UPLOAD_TYPE_TRACK";
const UPLOAD_TYPE_METADATA_JSON = "UPLOAD_TYPE_METADATA_JSON";

export const UploadType = {
  artwork: UPLOAD_TYPE_ARTWORK,
  track: UPLOAD_TYPE_TRACK,
  metadataJson: UPLOAD_TYPE_METADATA_JSON,
};

export const createUpload = (type, item, formValues) => {
  const id = crypto.randomUUID();
  localStorage.setItem(
    `nina-upload-${id}`,
    JSON.stringify({ [type]: item, formValues })
  );
  return id;
};

export const updateUpload = (id, type, item, releaseInfo = undefined) => {
  const upload = getUpload(id);
  upload[type] = item;

  if (releaseInfo) {
    upload.releaseInfo = releaseInfo;
  }

  localStorage.setItem(`nina-upload-${id}`, JSON.stringify(upload));
};

export const getUpload = (id) => {
  const upload = localStorage.getItem(`nina-upload-${id}`);
  if (upload && upload !== "undefined") {
    return JSON.parse(upload);
  }
  return null;
};

export const uploadHasItemForType = (id, type) => {
  const upload = getUpload(id);
  if (upload) {
    return upload[type];
  }
  return false;
};

export const removeUpload = (id) => {
  localStorage.removeItem(`nina-upload-${id}`);
};
