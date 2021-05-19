import React, { useEffect } from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';

export default function <RecordType>(props: { columns: Column<RecordType>[], type: any, onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
  const { columns, type, onSelectAllClick } = props;

  return (
    <TableHead>
      <TableRow>
        {type && <TableCell padding="checkbox">
          {type === "checkbox" && <Checkbox onChange={onSelectAllClick} />}
        </TableCell>}
        {
          columns.map((item: any) => <TableCell key={item.key}>{item.title}</TableCell>)
        }
      </TableRow>
    </TableHead>
  );
}
