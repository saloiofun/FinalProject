import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Button from 'material-ui/Button'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import Alert from '../../components/Alert'
import API from '../../utils/Api'
import PageHeader from '../../components/PageHeader'
import SendIcon from 'material-ui-icons/Send'
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle
} from 'material-ui/Dialog'
import {
  FormLabel,
  FormControl,
  FormGroup,
  FormControlLabel
} from 'material-ui/Form'
import Checkbox from 'material-ui/Checkbox'
import Chip from 'material-ui/Chip'
import AddIcon from 'material-ui-icons/Add'
import FaceIcon from 'material-ui-icons/Face'
import Avatar from 'material-ui/Avatar'
import Slide from 'material-ui/transitions/Slide'
import RemoveRedEyeIcon from 'material-ui-icons/RemoveRedEye'

import compose from 'recompose/compose'
import { connect } from 'react-redux'

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    paddingTop: 80,
    margin: '0 auto',
    marginBottom: 30,
    minHeight: '100vh',
    [theme.breakpoints.up('md')]: {
      width: '80%',
      paddingLeft: theme.spacing.unit * 3,
      paddingRight: theme.spacing.unit * 3
    }
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: theme.spacing.unit
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  alerts: {
    top: 80
  },
  button: {
    margin: theme.spacing.unit,
    marginLeft: 'auto',
    marginRight: theme.spacing.unit
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  }
})

function Transition (props) {
  return <Slide direction='up' {...props} />
}

class SendInvites extends React.Component {
  state = {
    to: '',
    subject: 'Event Name',
    message: `Hi, you are invited to my event! 
Please click on the link to let me know if you can make it!`,
    error: false,
    emailsSent: false,
    emailURL: process.env.REACT_APP_EMAIL_LINK,
    guests: []
  }

  validateEmail = (email) => {
    let reg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    if (reg.test(email)) {
      return true
    } else {
      return false
    }
  }

  handleRequestClose = () => {
    this.setState({ error: false, emailsSent: false })
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    })
  };

  handleCheckChange = name => (event, checked) => {
    this.setState({ [name]: checked })
  };

  importOpen = () => {
    API.getGuests()
    .then((data) => {
      this.setState({ guests: data.data })
      for (let i in data.data) {
        this.setState({ [data.data[i]._id]: false })
      }
    })
    this.setState({ open: true })
  }

  importClose = () => {
    this.setState({
      open: false
    })
  }

  onImport = () => {
    var newTo = this.state.to
    for (let i in this.state.guests) {
      if (this.state[this.state.guests[i]._id]) {
        if (newTo === '') {
          newTo += this.state.guests[i].guestEmail
        } else {
          newTo += ';' + this.state.guests[i].guestEmail
        }
      }
    }
    this.setState({
      to: newTo
    })
    this.importClose()
  }

  onSend = () => {
    this.setState({emailsSent: false})
    let emailArray = this.state.to.split(';')

    for (let i in emailArray) {
      if (!this.validateEmail(emailArray[i].trim())) {
        this.setState({error: true})
        return
      }
    }
    this.setState({error: false})

    for (let i in emailArray) {
      let email = {
        to: emailArray[i],
        subject: this.state.subject,
        message: this.state.message,
        url: this.state.emailURL,
        eventId: this.props.currentEvent._id
      }
      console.log(email)

      API.sendEmail(email)
      .then((data) => {
        this.setState({emailsSent: true})
        console.log('Data:', data)
      })
      .catch((err) => {
        if (err) throw err
      })
    }
  }

  render () {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <PageHeader title='Send Invites' body={`Send Invites!`} />
        <Chip
          avatar={
            <Avatar className={classes.Avatar}>
              <FaceIcon className={classes.FaceIcon} />
            </Avatar>
            }
          label=' Import Guests ' style={{backgroundColor: '#009688', color: 'white'}}
          onClick={this.importOpen}
          onRequestDelete={this.importOpen}
          deleteIcon={<AddIcon style={{color: 'white'}} />}
        />
        <Dialog open={this.state.open} onRequestClose={this.importClose} transition={Transition}>
          <DialogTitle>Import Guests</DialogTitle>
          <DialogContent>
            <div>
              <FormControl component='fieldset'>
                <FormLabel component='legend'>Select Guests</FormLabel>
                <FormGroup>
                  {
                      this.state.guests.map(guestObject => {
                        return (
                          <FormControlLabel
                            key={guestObject._id}
                            control={
                              <Checkbox
                                checked={this.state[[guestObject._id]]}
                                onChange={this.handleCheckChange(guestObject._id)}
                                name={guestObject._id}
                                value={guestObject._id}
                              />
                              }
                            label={guestObject.guestName
                            ? guestObject.guestEmail + ' (' + guestObject.guestName + ')' : guestObject.guestEmail}
                          />
                        )
                      })
                  }
                </FormGroup>
              </FormControl>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.importClose} color='primary'>
              Cancel
            </Button>
            <Button onClick={this.onImport} color='primary'>
              Import
            </Button>
          </DialogActions>
        </Dialog>
        <Paper elevation={4}>
          <form className={classes.container} noValidate autoComplete='off'>
            <TextField
              label='To'
              placeholder='Separate emails by semicolons'
              value={this.state.to}
              className={classes.textField}
              fullWidth
              margin='normal'
              onChange={this.handleChange('to')}
            />
            <TextField
              id='subject'
              label='Subject'
              value={this.state.subject}
              className={classes.textField}
              margin='normal'
              fullWidth
              onChange={this.handleChange('subject')}
            />
            <TextField
              id='message'
              label='Message'
              multiline
              rows='10'
              fullWidth
              value={this.state.message}
              className={classes.textField}
              margin='normal'
              onChange={this.handleChange('message')}
              />
            <div className={classes.button}>
              <Button className={classes.button} raised color='primary' >
              Preview
              <RemoveRedEyeIcon className={classes.rightIcon} />
              </Button>
              <Button raised color='primary' onClick={this.onSend} >
              Send
              <SendIcon className={classes.rightIcon} />
              </Button>
            </div>
          </form>
          <Alert
            open={this.state.error}
            onRequestClose={this.handleRequestClose}
            message='Error: Make sure all you entered all emails correctly'
        />
          <Alert
            open={this.state.emailsSent}
            onRequestClose={this.handleRequestClose}
            message='Invite(s) were sent!'
        />
        </Paper>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    currentEvent: state.event.currentEvent
  }
}

SendInvites.propTypes = {
  classes: PropTypes.object.isRequired
}

export default compose(
  withStyles(styles, {
    name: 'Dashboard'
  }), connect(mapStateToProps)
)(SendInvites)
