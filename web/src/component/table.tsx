import React, { useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import TableHead from '@/component/table_head';
import TableToolbar from '@/component/table_toolbar';
import PaginationAction from '@/component/pagination_action';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
    },
  }),
);

export default function <RecordType>(props: { title: any, dataSource: any[], columns: Column<RecordType>[], pagination: any, rowSelection: any, tableButtons: any[], selectionButtons: any[] }) {
  const { title, dataSource, columns, pagination, rowSelection, tableButtons, selectionButtons } = props;
  const classes = useStyles();

  // 分页处理
  const [page, setPage] = React.useState(0);

  const [rowsPerPage, setRowsPerPage] = React.useState(pagination.defaultPageSize);

  useEffect(() => {
    pagination.onChange(page + 1, rowsPerPage)
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
    rowSelection?.onSelectChange(newSelected);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newSelected: any[] = [];
    if (event.target.checked) {
      newSelected = dataSource;
    }
    setSelected(newSelected);
    rowSelection?.onSelectChange(newSelected);
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <TableToolbar
          title={title}
          numSelected={selected.length}
          tableButtons={tableButtons}
          selectionButtons={selectionButtons}
        />
        <TableContainer>
          <Table className={classes.table}>
            <TableHead<RecordType> columns={columns} type={rowSelection?.type} onSelectAllClick={handleSelectAllClick} />
            <TableBody>
              {
                dataSource.map((item: any) =>
                  <TableRow hover key={item.id}>
                    {rowSelection && <TableCell padding="checkbox">
                      {rowSelection.type === "checkbox" ? <Checkbox checked={isSelected(item.id)} onChange={() => handleSelectClick(item, rowSelection.type)} /> :
                        <Radio checked={isSelected(item.id)} onChange={() => handleSelectClick(item, rowSelection.type)} />}
                    </TableCell>}
                    {
                      columns.map(column => <TableCell key={column.key}>{column.render ? column.render(item) : item[column.key]}</TableCell>)
                    }
                  </TableRow>
                )
              }
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          labelRowsPerPage="分页"
          labelDisplayedRows={() => `${page + 1} / ${Math.ceil(pagination.total / rowsPerPage)}`}
          page={page}
          count={pagination.total}
          rowsPerPage={pagination.defaultPageSize}
          rowsPerPageOptions={pagination.pageSizeOptions}
          ActionsComponent={PaginationAction}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
