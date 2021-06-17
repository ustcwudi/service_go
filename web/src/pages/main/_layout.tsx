import React, { useState, useEffect, useMemo, useContext } from 'react';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { useModel, useRequest, history } from 'umi';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import Box from '@material-ui/core/Box';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Icon from '@/component/icon/icon'
import UploadPassword from '@/component/modal/update_password'
import context from '@/context'

const theme = createMuiTheme({
  palette: {
    primary: { main: '#407cac' },
    secondary: { main: '#c85d44' },
  },
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    nested: {
      paddingLeft: theme.spacing(4),
    },
    logo: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      color: 'white'
    },
    breadcrumbs: {
    },
    breadcrumb: {
      display: 'flex',
    },
    icon: {
      marginRight: theme.spacing(0.5),
    },
    main: {
      display: 'flex',
      minHeight: '100%',
      paddingTop: theme.spacing(8),
      backgroundColor: '#eee',
    },
    menu: {
      width: 200,
      minWidth: 200,
      margin: theme.spacing(2, 0, 2, 2),
    },
    iconMenu: {
      width: 80,
      minWidth: 80,
      margin: theme.spacing(2, 0, 2, 2),
    },
    menuItem: {
      justifyContent: 'center'
    },
    menuItemIcon: {
      color: '#000'
    },
    content: {
      padding: theme.spacing(2),
      flex: 1,
      backgroundColor: '#eee'
    }
  }),
);

export default (props: any) => {
  const classes = useStyles();
  // 用户菜单
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);
  // 对话框
  const [modal, setModal] = useState<JSX.Element | undefined>(undefined);
  // 简略菜单
  const [iconMenu, setIconMenu] = useState<boolean>(false);
  // 菜单列表
  const [menuArray, setMenuArray] = useState<MenuItem[]>([]);
  // 当前一级菜单ID
  const [topMenu, setTopMenu] = useState<MenuItem>();
  // 展开二级菜单ID
  const [expandMenu, setExpandMenu] = useState<string>();
  // 提示框
  const [alert, setAlert] = useState<{ type: "info" | "success" | "error" | "warning", message: string } | undefined>(undefined);
  // 用户信息
  const { user, role, login, logout } = useModel('auth', model => ({
    user: model.user,
    role: model.role,
    login: model.login,
    logout: model.logout,
  }));
  // 用户信息获取请求
  useRequest(
    () => ({
      url: `/api/user/info`,
      method: 'get',
      headers: {
        Link: 'role',
      },
    }),
    {
      onSuccess: (result, params: any) => {
        if (result.success) {
          login(result.data, result.map.role[0]);
          menuRequest.run();
        } else {
          history.push('/frame/login');
        }
      },
    },
  );
  // 用户登出
  const exit = useRequest(
    () => ({
      url: `/api/user/logout`,
      method: 'post',
    }),
    {
      manual: true,
      onSuccess: (result, params: any) => {
        logout();
        history.push('/frame/login');
      },
    },
  );
  // 请求菜单列表
  const menuRequest = useRequest(
    () => ({
      url: `/api/admin/menu?role=${role.id}`,
      method: 'get',
    }),
    {
      manual: true,
      onSuccess: (result, params: any) => {
        if (result.data) {
          // 转换为MenuItem类型
          result.data = result.data.map((i: any) => {
            return {
              key: i.id,
              parent: i.parent,
              title: i.name,
              path: i.path,
              icon: i.icon
            }
          });
          setMenuArray(result.data);
        } else {
          // 无菜单数据，退回登录
          history.push('/frame/login');
        }
      },
    },
  );
  // 菜单结构
  const menuTree = useMemo(() => {
    // 提取一级菜单
    let topMenu: MenuItem[] = [];
    menuArray.forEach((item: any) => {
      if (!item.parent) topMenu.push(item)
    });
    // 提取二级菜单
    let subMenu: MenuItem[] = [];
    topMenu.forEach((parent: MenuItem) => {
      menuArray.forEach((item: any) => {
        if (item.parent === parent.key) {
          if (parent.children == undefined) parent.children = []
          parent.children.push(item)
          subMenu.push(item)
        }
      });
    });
    // 提取三级菜单
    subMenu.forEach((parent: MenuItem) => {
      menuArray.forEach((item: any) => {
        if (item.parent === parent.key) {
          if (parent.children == undefined) parent.children = []
          parent.children.push(item)
        }
      });
    });
    return topMenu;
  }, [menuArray]
  );
  // 面包屑菜单
  const breadcrumb = useMemo(() => {
    let list: MenuItem[] = [];
    // 检查当前路径是否在列表中
    if (history.location.pathname) {
      menuArray.forEach((item: MenuItem) => {
        if (item.path && history.location.pathname.indexOf(item.path) === 0) {
          list.push(item);
          let parent = item.parent;
          while (parent) {
            let parentItem = menuArray.find(i => i.key === parent);
            if (parentItem) {
              list.push(parentItem);
              parent = parentItem.parent;
            }
          }
        }
      });
    };
    return list.reverse()
  }, [menuArray, history.location.pathname]
  );
  // 导航菜单
  const navMenu = useMemo(() => {
    let topKey = topMenu ? topMenu.key : breadcrumb[0]?.key
    let currentKey = breadcrumb[breadcrumb.length - 1]?.key
    let topNode = menuTree.find((i: MenuItem) => i.key === topKey)
    return topNode ? <Paper elevation={5}><List component="nav">{topNode.children?.map((i: MenuItem) => <Box key={i.key}>
      <ListItem selected={i.key === currentKey} className={classes.menuItem} button onClick={() => i.children ? setExpandMenu(i.key) : i.path && history.push(i.path)}>
        {iconMenu ? <Icon name={i.icon} /> : <>
          <ListItemIcon className={classes.menuItemIcon}><Icon name={i.icon} /></ListItemIcon>
          <ListItemText primary={i.title} />
          {i.children && <Icon name={expandMenu === i.key ? "ExpandLess" : "ExpandMore"} />}
        </>}
      </ListItem>
      {
        i.children && <Collapse in={expandMenu === i.key} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {i.children.map((i: MenuItem) => <ListItem key={i.key} button selected={i.key === currentKey} className={classes.menuItem} onClick={() => i.path && history.push(i.path)}>
              {iconMenu ? <Icon color="action" name={i.icon} /> : <><ListItemIcon><Icon name={i.icon} /></ListItemIcon><ListItemText primary={i.title} /></>}
            </ListItem>)}
          </List>
        </Collapse>
      }
    </Box>)}</List></Paper> : undefined
  }, [topMenu, breadcrumb, iconMenu, expandMenu]
  );
  return <ThemeProvider theme={theme}>
    <AppBar>
      <Toolbar>
        <IconButton edge="start" className={classes.logo} color="inherit" onClick={() => setIconMenu(!iconMenu)}>
          <Icon name={iconMenu ? "MenuOpen" : "Menu"} />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          管理终端
        </Typography>
        {
          menuTree.map((i: MenuItem) => <Button color="inherit" startIcon={<Icon name={i.icon} />} onClick={() => setTopMenu(i)} key={i.key}>{i.title}</Button>)
        }
        <Button color="inherit" startIcon={<Icon name="AccountCircle" />} onClick={e => setUserMenuAnchor(e.currentTarget)}>{user?.name}</Button>
      </Toolbar>
    </AppBar>
    <Box className={classes.main}>
      <Box className={iconMenu ? classes.iconMenu : classes.menu}>
        {navMenu}
      </Box>
      <Box className={classes.content}>
        <context.Provider value={{
          title: <Breadcrumbs className={classes.breadcrumbs}>
            {breadcrumb.map(i => <Typography color="textPrimary" className={classes.breadcrumb} key={i.key}><Icon classes={{ icon: classes.icon }} name={i.icon} /> {i.title}</Typography>)}
          </Breadcrumbs>,
          alert: setAlert
        }}>{breadcrumb.length > 0 ? props.children : undefined}</context.Provider>
      </Box>
    </Box>
    <Menu
      anchorEl={userMenuAnchor}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={userMenuAnchor !== null}
      onClose={() => setUserMenuAnchor(null)}
    >
      <MenuItem onClick={() => { setModal(<UploadPassword setAlert={setAlert} onCancel={() => setModal(undefined)} />); setUserMenuAnchor(null); }}>修改密码</MenuItem>
      <MenuItem onClick={() => { exit.run(); setUserMenuAnchor(null); }}>退出登录</MenuItem>
    </Menu>
    {modal}
    <Snackbar open={alert != undefined} autoHideDuration={3000} transitionDuration={0} onClose={(event, reason) => { if (reason !== 'clickaway') setAlert(undefined) }}>
      <MuiAlert elevation={6} onClose={() => setAlert(undefined)} severity={alert?.type} variant="filled">
        {alert?.message}
      </MuiAlert>
    </Snackbar>
  </ThemeProvider>;
};
