import ErrorCard from "@core/ui/reporter/components/ErrorCard";
import PluginReporter from "@core/ui/reporter/PluginReporter";
import { Codeblock } from "@lib/ui/components";
import { Card, Text } from "@metro/common/components";

export default function PluginErrorCard(props: { id: string }) {
    const error = PluginReporter.getError(props.id);

    if (error instanceof Error) {
        return <ErrorCard
            header={<Text variant="heading-lg/bold">{props.id}</Text>}
            error={error}
        />;
    } else {
        return <Card style={{ gap: 8 }}>
            <Text variant="heading-md/bold">{props.id}</Text>
            <Codeblock selectable={true}>{String(error)}</Codeblock>
        </Card>;
    }
}
