import React, { useMemo } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    ellipsis: {
      maxWidth: '200px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      '& > *': {
        margin: theme.spacing(0, 0.5),
      },
    },
    button: {
      display: 'flex'
    }
  }),
);

export default function <T extends { id: string, [index: string]: any }>(
  props: {
    dataSource: T[],
    selection: T[],
    size: "medium" | "small",
    columns: (Column<T> | undefined)[],
    selectType: "checkbox" | "radio" | undefined,
    onSelectChange: (records: T[]) => void
  }) {
  const { dataSource, size, columns, selectType, selection, onSelectChange } = props;
  const classes = useStyles();

  const checkList = useMemo(() => dataSource.map(item => selection.findIndex(i => i.id == item.id)), [dataSource, selection]);

  const handleSelect = (list: T[], checked: boolean) => {
    let newSelection: T[] = [...selection];
    if (selectType == "checkbox") {
      list.forEach(item => {
        const index = newSelection.findIndex((i: T) => i.id === item.id);
        if (index == -1 && checked) {
          newSelection.push(item);
        } else if (index != -1 && !checked) {
          newSelection = newSelection.slice(0, index).concat(newSelection.slice(index + 1, newSelection.length));
        }
      })
    } else {
      newSelection = list;
    }
    onSelectChange(newSelection);
  };

  return <Table size={size}>
    <TableHead>
      <TableRow>
        {selectType && <TableCell padding="checkbox">
          {selectType === "checkbox" && <Checkbox checked={checkList.length > 0 && checkList.findIndex(i => i < 0) == -1} onChange={e => handleSelect(dataSource, e.currentTarget.checked)} />}
        </TableCell>}
        {columns.map((item) => item ? <TableCell key={item.name}> {item.label} </TableCell> : undefined)}
      </TableRow>
    </TableHead><TableBody>
      {
        dataSource.map((item: T, index: number) =>
          <TableRow hover key={item.id}>
            {selectType && <TableCell padding="checkbox">
              {selectType === "checkbox" ? <Checkbox checked={checkList[index] > -1} onChange={e => handleSelect([item], e.currentTarget.checked)} /> :
                <Radio checked={checkList[index] > -1} onChange={e => handleSelect([item], e.currentTarget.checked)} />}
            </TableCell>}
            {
              columns.map(column => column && <TableCell
                className={column.name == "_" ? classes.button : classes.ellipsis}
                key={column.name}
                align={column.name == "_" ? "right" : "left"}>
                {column.render ? column.render(item) : item[column.name]}
              </TableCell>)
            }
          </TableRow>
        )
      }
    </TableBody></Table>
}
