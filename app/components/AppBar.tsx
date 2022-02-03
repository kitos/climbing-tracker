import {
  AppBar as MuiAppBar,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import { Link } from '@remix-run/react'
import { AccountCircle } from '@mui/icons-material'
import { useState } from 'react'

let menuId = 'user-menu'

export let AppBar = ({ userId }: { userId?: string | null }) => {
  let [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  let closeMenu = () => setAnchorEl(null)

  return (
    <MuiAppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="open drawer"
          sx={{ mr: 2 }}
        >
          <Link to="/" style={{ textDecoration: 'none' }}>
            🧗‍♀️
          </Link>
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            Tracker
          </Link>
        </Typography>

        <IconButton
          size="large"
          edge="end"
          aria-label="account of current user"
          aria-controls={menuId}
          aria-haspopup="true"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          color="inherit"
        >
          <AccountCircle />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          id={menuId}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={closeMenu}
        >
          {userId && (
            <MenuItem component={Link} to="/profile" onClick={closeMenu}>
              Profile
            </MenuItem>
          )}

          <MenuItem
            component={Link}
            to={userId ? '/logout' : '/login'}
            onClick={closeMenu}
          >
            {userId ? 'Logout' : 'Login'}
          </MenuItem>
        </Menu>
      </Toolbar>
    </MuiAppBar>
  )
}
