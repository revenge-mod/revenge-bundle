import { Strings } from "@core/i18n";
import { findAssetId } from "@lib/api/assets";
import { Codeblock } from "@lib/ui/components";
import { Button, Card, Stack, Text } from "@metro/common/components";

interface ErrorCardProps {
    error: unknown;
    onRetryRender?: () => void;
}

export default function ErrorCard(props: ErrorCardProps) {
    return <Card>
        <Stack>
            <Text variant="heading-lg/bold">{Strings.UH_OH}</Text>
            <Codeblock selectable>{String(props.error)}</Codeblock>
            {props.onRetryRender && <Button
                icon={findAssetId("RetryIcon")}
                text={Strings.RETRY_RENDER}
                onPress={props.onRetryRender}
            />}
        </Stack>
    </Card>;
}
