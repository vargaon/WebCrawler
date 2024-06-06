import { useOutletContext, Form as RemixForm, useNavigation, ClientActionFunctionArgs, redirect, useActionData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Button, Form, Spinner, Toast, ToastContainer } from "react-bootstrap";
/*eslint import/no-unresolved: [0, { ignore: ["^~/"] }]*/
import { WebsiteFormFields } from "~/components/WebsiteFormFields";
import { editWebsite, type Website } from "~/services/website";

export const clientAction = async ({
    params,
    request,
}: ClientActionFunctionArgs) => {
    if (params.id === undefined) {
        throw new Error("missing id");
    }
    const formData = await request.formData();
    const formUrl: string = String(formData.get("url"));
    const formRegex: string = String(formData.get("regex"));
    const formLabel: string = String(formData.get("label"));
    let formTagString: string  = String(formData.get("tags"));
    if(formTagString.endsWith(",")) {
        formTagString = formTagString.slice(0,formTagString.length - 1);
    }
    const tags = formTagString.length > 0 ? formTagString.split(",") : [];
    const formPeriodicityValue: string = String(formData.get("periodicity-value"));
    const formPeriodicityUnit: string = String(formData.get("periodicity-unit"));
    const formActive: File | string | null = formData.get("active");
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
        await editWebsite(params.id, website);
    } catch (e) {
        console.error(e);
        return { errorHeader: "Failed to save website record", errorMessage: "An error occured, see developer console for details." };
    }
    return redirect("../detail");

};

export default function WebsiteEdit() {
    //const data = useLoaderData<typeof Loader>();
    const context = useOutletContext<Website>();
    const navigation = useNavigation();
    const actionData = useActionData<typeof clientAction>();
    const isSubmitting = navigation.state != "idle";
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
    return <>
        <h1>Website detail</h1>
        <Form method="post" as={RemixForm} validated={true}>
            <WebsiteFormFields websiteData={context} />
            <Button className="btn btn-success" type="submit" disabled={isSubmitting}>{isSubmitting ? (<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />) : ("Save")}</Button>
        </Form>
        <ToastContainer position="top-center" className="position-fixed">
            <Toast show={showToast} bg="warning">
                <Toast.Body><div className="text-center"><strong>{actionData?.errorHeader}</strong></div><hr></hr>{actionData?.errorMessage}</Toast.Body>
            </Toast>
        </ToastContainer>

    </>
}