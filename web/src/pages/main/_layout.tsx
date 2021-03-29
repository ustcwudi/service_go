import React, { useState, useEffect } from 'react';
import { message, Layout, Menu, Breadcrumb, ConfigProvider, Typography } from 'antd';
import { useModel, useRequest, history } from 'umi';
import { UserOutlined, PoweroffOutlined, StarOutlined, TagOutlined, KeyOutlined } from '@ant-design/icons';
import zhCN from 'antd/lib/locale/zh_CN';
import UploadPassword from '@/component/update_password'

const { Header, Content, Sider } = Layout;

export default (props: any) => {
  // 通过权限检查
  const [pass, setPass] = useState<boolean>(false);
  // 当前路径
  const [path, setPath] = useState('');
  // 对话框
  const [modal, setModal] = useState<JSX.Element | undefined>(undefined);
  // 菜单列表
  const [menuArray, setMenuArray] = useState<MenuItem[]>([]);
  // 菜单结构
  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);
  // 当前面包屑菜单
  const [breadcrumb, setBreadcrumb] = useState<any[]>([]);
  // 当前一级菜单ID
  const [topMenu, setTopMenu] = useState<string>();
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
          message.error("用户未登录");
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
        message.success("退出系统");
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
        item.icon = item.icon ? item.icon : <StarOutlined />;
        menu.push(item);
      }
    });
    // 提取二级菜单
    menu.forEach((parent: MenuItem) => {
      parent.children = new Array<MenuItem>();
      menuArray.forEach((item: any) => {
        if (item.parent === parent.key) {
          item.icon = item.icon ? item.icon : <TagOutlined />;
          parent.children?.push(item);
        }
      });
    });
    setMenuTree(menu);
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
  return (<ConfigProvider locale={zhCN}>
    <Layout style={{ minHeight: '100%' }}>
      <Header style={{ padding: 0 }}>
        <div style={{ float: 'left', width: 200, height: 64 }}>
          <img style={{ float: 'left', margin: '14px 14px 0 30px', width: 36, height: 36 }} src='/static/logo.svg' />
          <Typography.Title style={{ float: 'left', color: '#eee', marginTop: 18 }} level={4}>管理终端</Typography.Title>
        </div>
        <Menu theme="dark" mode="horizontal" selectedKeys={[topMenu ? topMenu : breadcrumb?.[0]?.key]}>
          {
            menuTree.map((i: MenuItem) => <Menu.Item icon={i.icon} onClick={() => setTopMenu(i.key)} key={i.key}>{i.title}</Menu.Item>)
          }
          <Menu.SubMenu key="mine" style={{ float: 'right' }} icon={<UserOutlined />} title={user?.name}>
            <Menu.Item icon={<KeyOutlined />} onClick={() => { setModal(<UploadPassword onCancel={() => setModal(undefined)} />) }} key="modifyPassword">修改密码</Menu.Item>
            <Menu.Item icon={<PoweroffOutlined />} onClick={() => { exit.run(); }} key="logout">退出系统</Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </Header>
      <Layout>
        <Sider width={200}>
          <Menu
            mode="inline"
            selectedKeys={[breadcrumb?.[1]?.key]}
            style={{ height: '100%' }}
          >
            {
              menuTree.find((i: MenuItem) => i.key === topMenu)?.children?.map((i: MenuItem) =>
                i.children ? <Menu.SubMenu key={i.key} icon={i.icon} title={i.title}>
                  {i.children.map((i: MenuItem) => <Menu.Item key={i.key}>{i.title}</Menu.Item>)}
                </Menu.SubMenu> : <Menu.Item key={i.key} icon={i.icon} onClick={() => i.path && history.push(i.path)}>{i.title}</Menu.Item>)
            }
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            {
              breadcrumb.map(i => <Breadcrumb.Item key={i.key}>{i.icon} {i.title}</Breadcrumb.Item>)
            }
          </Breadcrumb>
          <Content
            style={{
              margin: 0,
              minHeight: 680,
            }}
          >
            {pass ? props.children : undefined}
          </Content>
        </Layout>
      </Layout>
    </Layout>
    {modal}
  </ConfigProvider >
  );
};
