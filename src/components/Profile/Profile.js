import React, { Component } from 'react'
import './Profile.css'
import Settings from './Settings'
import Stats from './Stats'

import { Spinner } from '@blueprintjs/core'

const headerBackground = function(profileBackgroundURL) {
  return {
    backgroundImage: `url('${profileBackgroundURL}')`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundColor: 'aquamarine',
    color: 'white',
    width: '100%',
    minHeight: '200px',
    borderRadius: '5px',
    padding: '20px',
    boxShadow: 'inset 0 0 5px black',
    display: 'flex',
    flexWrap: 'wrap',
  }
}

class Profile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      stats: {},
      // user: props.serverState(["me", "user"]),
      // stats: props.serverState(["me", "stats"]) || {}
    }
  }

  async componentDidMount() {
    const { userid } = this.props

    if (!userid) {
      const user = await this.props.callAction('me')
      this.setState({ user })
    } else {
      const { user, stats } = await this.props.callAction(
        'getPublicUserDetails',
        { userid }
      )
      this.setState({ user, stats })
    }
  }

  onBackgroundChange = url => {
    var user = this.state.user
    user.profileBackgroundURL = url
    this.setState({ user })
  }

  render() {
    var { user, stats } = this.state
    var { actions, userid } = this.props

    if (!user)
      return (
        <div style={{ padding: '20px' }}>
          <Spinner />
        </div>
      )

    return (
      <div className="Profile-content">
        <div
          style={headerBackground(
            user.profileBackgroundURL ||
              'https://media.giphy.com/media/OK5LK5zLFfdm/giphy.gif'
            // 'https://media.giphy.com/media/BlcWQ9L2VfOFO/giphy.gif'
          )}
        >
          <div className="Profile-content-header">
            <div>
              <img
                className="Profile-content-header-avatar"
                src={user.avatarurl}
                alt={user.username}
              />
            </div>
            <div className="Profile-content-header-userdetails">
              <span className="Profile-content-header-username">
                {user.username}
              </span>
              <span className="Profile-content-header-steamurl">
                <b>SteamID:</b> {user.steamid}
              </span>
              {/* <span className="Profile-content-header-steamurl"><b>ProfileURL:</b> <a target="_Blank" href={user.steamProfileURL}>{user.steamProfileURL}</a></span> */}
            </div>
          </div>
        </div>
        <div className="Profile-content-body">
          {/* <Stats
            deposited={stats.steamItemsDeposited}
            trades={stats.successCount}
            value={stats.steamValueDeposited}
          /> */}
          {userid ? null : (
            <Settings
              {...this.props}
              actions={actions}
              user={user}
              onBackgroundChange={this.onBackgroundChange}
            />
          )}
        </div>
      </div>
    )
  }
}

export default Profile
