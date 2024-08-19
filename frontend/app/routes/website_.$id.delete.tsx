import { ClientActionFunctionArgs, redirect } from "@remix-run/react";
import { deleteWebsite } from "~/services/website";

export const clientAction = async({
    params,
}: ClientActionFunctionArgs) => {
    if(params.id === undefined) {
        throw new Error("Website id is required");
    }
    deleteWebsite(params.id);
    return redirect("/websites");
}
