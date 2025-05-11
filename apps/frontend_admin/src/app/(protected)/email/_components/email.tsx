/* eslint-disable react/no-children-prop */
import { Markdown, Html } from "@react-email/components";

interface EmailProps {
    content: string;
}

export default function Email({ content }: EmailProps) {
    return (
        <Html lang="en" dir="ltr">
            <Markdown
                // markdownCustomStyles={{
                //     h1: { color: "red" },
                //     h2: { color: "blue" },
                //     codeInline: { background: "grey" },
                // }}
                // markdownContainerStyles={{
                //     padding: "12px",
                //     border: "solid 1px black",
                // }}
            >{content}</Markdown>

            {/* OR */}

            {/* <Markdown children={`# This is a ~~strikethrough~~`} /> */}
        </Html>
    );
};
