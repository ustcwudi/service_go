import React, { useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    }
  }),
);

export default function <RecordType>(props: { dataSource: any[], columns: Column<RecordType>[], selectType: any, onSelectChange: any, signal: { message?: 'select_all' | 'select_none' } }) {
  const { dataSource, columns, selectType, onSelectChange, signal } = props;
  const classes = useStyles();

  // 选中处理
  const [selected, setSelected] = React.useState<any[]>([]);

  const isSelected = (id: string) => selected.findIndex((value: any) => value.id === id) !== -1;

  const handleSelectClick = (item: any, type: any) => {
    let newSelected: any[] = [];

    if (type === "checkbox") {
      const selectedIndex = selected.findIndex((value: any) => value.id === item.id);
      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, item);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1),
        );
      }
    } else {
      newSelected = [item];
    }

    setSelected(newSelected);
    onSelectChange(newSelected);
  };

  useEffect(() => {
    switch (signal.message) {
      case 'select_all':
        setSelected(dataSource);
        onSelectChange(dataSource);
        break;
      case 'select_none':
        setSelected([]);
        onSelectChange([]);
        break;
    }
  }, [signal])

  return <TableBody className={classes.root}>
    {
      dataSource.map((item: any) =>
        <TableRow hover key={item.id}>
          {selectType && <TableCell padding="checkbox">
            {selectType === "checkbox" ? <Checkbox checked={isSelected(item.id)} onChange={() => handleSelectClick(item, selectType)} /> :
              <Radio checked={isSelected(item.id)} onChange={() => handleSelectClick(item, selectType)} />}
          </TableCell>}
          {
            columns.map(column => <TableCell key={column.key}>{column.render ? column.render(item) : item[column.key]}</TableCell>)
          }
        </TableRow>
      )
    }
  </TableBody>
}
