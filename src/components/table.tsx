import React from 'react';
import useResizeObserver from '@react-hook/resize-observer';

import {StateHolder} from "../spreadsheet.js";
import {DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT} from "./table.old.js";

// export type ColumnHeader = () => React.ReactNode;
export interface ColumnHeader {
    title: string,
    width: number,

    render: (col: ColumnHeader) => React.ReactNode
}

interface TableRow {
    id: number;

    data: Record<string, () => React.ReactNode>
}

export interface TableProps<Row extends TableRow> {
    children: { data: Row[] },
    sheet: StateHolder,

    columns: Record<string, ColumnHeader>
}

export default function Table<Row extends TableRow>(props: TableProps<Row>) {
    const [columns, setColumns] = React.useState<ColumnHeader[]>(Object.values(props.columns));

    const ref = React.useRef<HTMLDivElement | null>(null);

    const resizeColumn = (colIndex: number, width: number) => setColumns(prev => prev.with(colIndex, {
        ...prev[colIndex],
        width
    }));

    return <section
        className={"table-widget"}
        ref={ref}
        onMouseOut={e => void 0}>

        <section
            className={"table-container"}
            style={{
                gridAutoColumns: `min-content ${columns.map(i => `${i.width ?? DEFAULT_COLUMN_WIDTH}px`).join(' ')} min-content`,
                gridAutoRows: `min-content`, //  ${props.rowHeights.map(i => `${i ?? DEFAULT_ROW_HEIGHT}px`).join(' ')}
            }}>

            <div className={"top-left-corner"}/>

            {columns.map((header, colIndex) => <TableHeaderCell
                onResize={size => resizeColumn(colIndex, size.width + 1)}
                header={header}
                colIndex={colIndex}
            />)}

            {props.children.data.map((row, rowIndex) => <>
                <div
                    className={"row"}
                    style={{
                        gridColumn: 1,
                        gridRow: rowIndex + 2
                    }}>
                    <div className={"row-title"}>{row.id}</div>
                </div>

                {columns.map((col, colIndex) => <div
                    className={"table-cell"}
                    key={`table-cell-${colIndex}:${rowIndex}`}
                    style={{
                        gridRow: rowIndex + 2,
                        gridColumn: colIndex + 2
                    }}>
                    {row.data[col.title]()}
                </div>)}
            </>)}

        </section>
    </section>;
}

export function TableHeaderCell(props: {
    onResize: (bounds: DOMRectReadOnly) => void,
    header: ColumnHeader,
    colIndex: number
}) {
    const ref = React.useRef<HTMLDivElement>(null);

    useResizeObserver(ref, e => props.onResize(e.contentRect));

    return <div
        className={"table-header-cell"}
        key={`table-header-${props.colIndex}`}
        style={{
            gridColumn: props.colIndex + 2,
            gridRow: 1,
            resize: "horizontal"
        }}
        ref={ref}>

        {props.header.render(props.header)}

    </div>
}