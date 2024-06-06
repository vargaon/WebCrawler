import { ClientLoaderFunctionArgs, Outlet, ShouldRevalidateFunctionArgs, useLoaderData } from "@remix-run/react";
/*eslint import/no-unresolved: [0, { ignore: ["^~/"] }]*/
import { getWebsite } from "~/services/website";

export function shouldRevalidate({
    actionResult,
    formAction,
    defaultShouldRevalidate,
} : ShouldRevalidateFunctionArgs) {
    console.log(formAction);
    if(formAction && actionResult?.errorMessage) {
        return false;
    }
    return defaultShouldRevalidate;
}

export const clientLoader = async({params} : ClientLoaderFunctionArgs) => {
    if(params.id === undefined) {
        throw new Error("missing id");
    }
    return await getWebsite(params.id);
}

export default function Website() {
    const websiteRouteData = useLoaderData();
    return <Outlet context={websiteRouteData}/>
}