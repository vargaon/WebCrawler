import { Website, createWebsite } from "../../services/website";
import WebsiteFormModal from "./WebsiteFormModal";

const websiteStub: Website = {
  "url": "",
  "regex": "",
  "label": "",
  "tags": [],
  "periodicity": {
      value: 1,
      unit: "day",
  },
  "active": true,
};

export default function CreateWebsiteModal({ initialWebsiteData = websiteStub, onClose, onCreate }: {
  initialWebsiteData?: Website,
  onClose: () => void,
  onCreate?: (createdWebsite: Website) => void,
}) {

  async function handleSubmitWebsite(website: Website) {
    const createdWebsite = await createWebsite(website);
    try {
      if(onCreate != null) {
        onCreate(createdWebsite);
      }
    } catch {
      // Dont't propagate errors from onCreate callback to form modal
    };
    return createdWebsite;
  }


  return (<WebsiteFormModal
    onClose={onClose}
    initialWebsiteData={initialWebsiteData}
    onSubmitWebsite={handleSubmitWebsite}
    headerText="Add website"
    submitButtonText="Add"
    cancelButtonText="Cancel"
    />);
}
