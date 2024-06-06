import { ClientActionFunctionArgs, Form as RemixForm, useActionData, useNavigation } from "@remix-run/react";
import { redirect } from "@remix-run/router";
import { useEffect, useState } from "react";
import { Button, Form, Spinner, Toast, ToastContainer } from "react-bootstrap";
/*eslint import/no-unresolved: [0, { ignore: ["^~/"] }]*/
import { WebsiteFormFields } from "~/components/WebsiteFormFields";
import { Website, createWebsite } from "~/services/website";

export const clientAction = async({
    request,
}: ClientActionFunctionArgs) => {
    const formData = await request.formData();
    const formUrl: string  = String(formData.get("url"));
    const formRegex: string  = String(formData.get("regex"));
    const formLabel: string  = String(formData.get("label"));
    let formTagString: string  = String(formData.get("tags"));
    if(formTagString.endsWith(",")) {
        formTagString = formTagString.slice(0,formTagString.length - 1);
    }
    const tags = formTagString.length > 0 ? formTagString.split(",") : [];
    const formPeriodicityValue: string  = String(formData.get("periodicity-value"));
    const formPeriodicityUnit: string = String(formData.get("periodicity-unit"));
    const formActive : File | string | null = formData.get("active");
    const website: Website = {
        "url": formUrl,
        "regex": formRegex,
        "label": formLabel,
        "tags": tags,
        "periodicity": {
            value: parseInt(formPeriodicityValue),
            unit: formPeriodicityUnit,
        },
        "active": (formActive === "on"),
    }
    try {
        const createdWebsite = await createWebsite(website);
        const websiteId = createdWebsite.id;
        return redirect("/website/" + websiteId + "/detail");
    } catch (e) {
        console.error(e);
        return { errorHeader: "Failed to create website record", errorMessage: "An error occured, see developer console for details." };
    }

};

export default function WebsiteCreate() {
    const actionData = useActionData<typeof clientAction>();
    const navigation = useNavigation();
    const isSubmitting = navigation.formAction == "/website/create";
    console.log(actionData);
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
    const [showToast, setShowToast] = useState(false);
    useEffect(() => {
        if (actionData?.errorMessage) {
            setShowToast(true);
        }
        const timeId = setTimeout(() => {
            // After 3 seconds set the show value to false
            setShowToast(false)
        }, 10000)

        return () => {
            clearTimeout(timeId)
        }
    }, [actionData])
    return (
        <>
        <h1>Add website to crawl</h1>
        <Form method="post" as={RemixForm} validated={true}>
            <WebsiteFormFields websiteData={websiteStub}/>
            <Button className="btn btn-success" type="submit" disabled={isSubmitting}>{isSubmitting ? (<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />) : ("Submit")}</Button>
        </Form>
        <ToastContainer position="top-center" className="position-fixed">
            <Toast show={showToast} bg="warning">
                <Toast.Body><div className="text-center"><strong>{actionData?.errorHeader}</strong></div><hr></hr>{actionData?.errorMessage}</Toast.Body>
            </Toast>
        </ToastContainer>
       </>
    );
}