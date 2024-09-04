import ErrorCard from "@core/ui/reporter/components/ErrorCard";
import { Nullish } from "@lib/utils/types";
import { React } from "@metro/common";
import { createLegacyClassComponentStyles, ThemeContext } from "@ui/styles";

type ErrorBoundaryState = {
    hasErr: false;
} | {
    hasErr: true;
    error: Error;
};

export interface ErrorBoundaryProps {
    children: JSX.Element | Nullish | (JSX.Element | Nullish)[];
}

const getStyles = createLegacyClassComponentStyles({
    view: {
        flex: 1,
        flexDirection: "column",
        margin: 10,
    },
    title: {
        fontSize: 20,
        textAlign: "center",
        marginBottom: 5,
    },
});

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasErr: false };
    }

    static contextType = ThemeContext;
    static getDerivedStateFromError = (error: Error) => ({ hasErr: true, error });

    render() {
        const styles = getStyles(this.context);
        if (!this.state.hasErr) return this.props.children;

        return (
            <ErrorCard error={this.state.error} onRetryRender={() => this.setState({ hasErr: false })} />
        );
    }
}
