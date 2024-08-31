import { Website, editWebsite } from "../../services/website";
import WebsiteFormModal from "./WebsiteFormModal";

export default function EditWebsiteModal({ websiteData, onClose }: { websiteData: Website, onClose: () => void }) {
  function handleSubmitWebsite(newWebsiteData: Website) {
    if(!websiteData.id) {
      throw new Error("Edit webiste: missing website.id.");
    }
    newWebsiteData.id = websiteData.id;
    return editWebsite(websiteData.id, newWebsiteData);
  }

  return (<WebsiteFormModal
    onClose={onClose}
    initialWebsiteData={websiteData}
    onSubmitWebsite={handleSubmitWebsite}
    headerText="Edit website"
    submitButtonText="Save"
    cancelButtonText="Cancel"
    />);
}
