import React, { useState, useEffect, useContext } from 'react';
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
import context from './context'

const theme = createMuiTheme({
  palette: {
    primary: { main: '#59A289' },
    secondary: { main: '#a0ac48' },
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
      flex: 1
    }
  }),
);

export default (props: any) => {
  const classes = useStyles();
  // 用户菜单
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);
  // 通过权限检查
  const [pass, setPass] = useState<boolean>(false);
  // 当前路径
  const [path, setPath] = useState('');
  // 对话框
  const [modal, setModal] = useState<JSX.Element | undefined>(undefined);
  // 对话框
  const [iconMenu, setIconMenu] = useState<boolean>(false);
  // 菜单列表
  const [menuArray, setMenuArray] = useState<MenuItem[]>([]);
  // 菜单结构
  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);
  // 当前面包屑菜单
  const [breadcrumb, setBreadcrumb] = useState<any[]>([]);
  // 当前一级菜单ID
  const [topMenu, setTopMenu] = useState<string>();
  // 展开二级菜单ID
  const [expandMenu, setExpandMenu] = useState<string>();
  // 展开二级菜单ID
  const [alert, setAlert] = useState<{ type: "info" | "success" | "error" | "warning", message: string } | undefined>(undefined);
  // 用户信息
  const { user, role, login, logout } = useModel('auth', model => ({
    user: model.user,
    role: model.role,
    login: model.login,
    logout: model.logout,
  }));
  // 路由监听
  useEffect(() => {
    const unlisten = history.listen((location: any, action: any) => {
      setPath(location.pathname);
    });

    return () => {
      unlisten();
    }
  }, [])
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
          //message.error("用户未登录");
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
        //message.success("退出系统");
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
          setPath(history.location.pathname);
        } else {
          // 无菜单数据，退回登录
          history.push('/frame/login');
        }
      },
    },
  );
  // 编制菜单结构
  useEffect(() => {
    let menu: MenuItem[] = [];
    menuArray.forEach((item: any) => {
      // 提取一级菜单
      if (!item.parent) {
        menu.push(item)
      }
    });
    // 提取二级菜单
    let subMenu: MenuItem[] = [];
    menu.forEach((parent: MenuItem) => {
      parent.children = new Array<MenuItem>();
      menuArray.forEach((item: any) => {
        if (item.parent === parent.key) {
          parent.children?.push(item)
          subMenu.push(item)
        }
      });
    });
    // 提取三级菜单
    subMenu.forEach((parent: MenuItem) => {
      menuArray.forEach((item: any) => {
        if (item.parent === parent.key) {
          if (parent.children == undefined)
            parent.children = new Array<MenuItem>()
          parent.children?.push(item)
        }
      });
    });
    setMenuTree(menu)
  }, [menuArray]
  );
  // 检查路径权限
  useEffect(() => {
    let pass = false;
    // 检查当前路径是否在列表中
    if (path) {
      menuArray.forEach((item: any) => {
        if (item.path && path.indexOf(item.path) === 0) {
          pass = true;
          // 构造面包屑导航
          let list = [item];
          let parent = item.parent;
          while (parent) {
            let parentItem = menuArray.find(i => i.key === parent);
            list.push(parentItem);
            parent = parentItem?.parent;
          }
          setBreadcrumb(list.reverse())
          if (list.length > 0) setTopMenu(list[0].key);
        }
      });
    };
    setPass(pass);
  }, [menuArray, path]
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
          menuTree.map((i: MenuItem) => <Button color="inherit" startIcon={<Icon name={i.icon} />} onClick={() => setTopMenu(i.key)} key={i.key}>{i.title}</Button>)
        }
        <Button color="inherit" startIcon={<Icon name="AccountCircle" />} onClick={e => setUserMenuAnchor(e.currentTarget)}>{user?.name}</Button>
      </Toolbar>
    </AppBar>
    <Box className={classes.main}>
      <Box className={iconMenu ? classes.iconMenu : classes.menu}>
        <Paper elevation={5}>
          <List component="nav">
            {
              menuTree.find((i: MenuItem) => i.key === topMenu)?.children?.map((i: MenuItem) => {
                return <Box key={i.key}>
                  <ListItem className={classes.menuItem} button onClick={() => i.children ? setExpandMenu(i.key) : i.path && history.push(i.path)}>
                    {iconMenu ? <Icon name={i.icon} /> : <>
                      <ListItemIcon className={classes.menuItemIcon}><Icon name={i.icon} /></ListItemIcon>
                      <ListItemText primary={i.title} />
                      {i.children && <Icon name={expandMenu === i.key ? "ExpandLess" : "ExpandMore"} />}
                    </>}
                  </ListItem>
                  {
                    i.children && <Collapse in={expandMenu === i.key} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {i.children.map((i: MenuItem) => <ListItem key={i.key} button className={classes.menuItem} onClick={() => i.path && history.push(i.path)}>
                          {iconMenu ? <Icon color="action" name={i.icon} /> : <><ListItemIcon><Icon name={i.icon} /></ListItemIcon><ListItemText primary={i.title} /></>}
                        </ListItem>)}
                      </List>
                    </Collapse>
                  }
                </Box>
              })
            }
          </List>
        </Paper>
      </Box>
      <Box className={classes.content}>
        <context.Provider value={{
          title: <Breadcrumbs className={classes.breadcrumbs}>
            {
              breadcrumb.map(i => <Typography color="textPrimary" className={classes.breadcrumb} key={i.key}><Icon classes={{ icon: classes.icon }} name={i.icon} /> {i.title}</Typography>)
            }
          </Breadcrumbs>,
          alert: setAlert
        }}>{pass ? props.children : undefined}</context.Provider>
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
      <MenuItem onClick={() => { setModal(<UploadPassword onCancel={() => setModal(undefined)} />); setUserMenuAnchor(null); }}>修改密码</MenuItem>
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
