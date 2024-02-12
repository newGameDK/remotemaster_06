function displaySelectedCommand() {
    if (selected) {
        //  Display if a command has been selected
        basic.showArrow(commandToArrow[commandIndex])
    }
    
}

input.onButtonPressed(Button.A, function on_button_pressed_a() {
    
    if (buttonsLocked) {
        return
    }
    
    //  Ignore if locked
    if (!selected) {
        group = (group + 1) % letters.length
        showGroupLetter()
        displaySelectedCommand()
    } else {
        commandIndex = (commandIndex + 1) % 4
        displaySelectedCommand()
    }
    
})
function showGroupLetter() {
    basic.showString("" + letters[group])
}

function sendCommand() {
    
    buttonsLocked = true
    //  Lock buttons during sending
    radio.sendNumber(commandIndex)
    startTime = input.runningTime()
    radio.onReceivedString(function on_received_string(receivedString: string) {
        
        //  Blink the check symbol upon ACK
        if (receivedString == "ACK") {
            acknowledged = true
            blinkCheckSymbol()
        }
        
    })
    //  Allow up to 5 seconds for an ACK to be received
    while (input.runningTime() - startTime < 5000 && !acknowledged) {
        basic.showArrow(commandToArrow[commandIndex])
        basic.pause(100)
        basic.clearScreen()
        basic.pause(100)
    }
    //  Show the cross for 2 seconds
    if (!acknowledged) {
        //  If not acknowledged within 5 seconds, show a cross
        basic.showIcon(IconNames.No)
        basic.pause(2000)
    }
    
    //  Do not unlock buttons or clear the screen here if ACK received
    //  as it's handled in blinkCheckSymbol function
    //  Show the last selected direction
    if (!acknowledged) {
        buttonsLocked = false
        //  Unlock buttons only if not acknowledged
        basic.clearScreen()
        displaySelectedCommand()
    }
    
}

input.onButtonPressed(Button.B, function on_button_pressed_b() {
    
    if (buttonsLocked) {
        return
    }
    
    //  Ignore if locked
    if (!selected) {
        selected = true
        radio.setGroup(group + 1)
        basic.showString("G" + letters[group])
    } else {
        sendCommand()
    }
    
})
//  Return to showing the selected command
function blinkCheckSymbol() {
    
    blinkEndTime = input.runningTime() + 5000
    while (input.runningTime() < blinkEndTime) {
        basic.showIcon(IconNames.Yes)
        basic.pause(200)
        basic.clearScreen()
        basic.pause(200)
    }
    buttonsLocked = false
    //  Unlock buttons after blinking period
    displaySelectedCommand()
}

let blinkEndTime = 0
let startTime = 0
let group = 0
let buttonsLocked = false
let commandIndex = 0
let selected = false
let commandToArrow : number[] = []
let letters : string[] = []
let acknowledged = false
letters = ["A", "B", "C", "D", "E"]
//  Lock mechanism for buttons
radio.setTransmitPower(7)
//  0: forward
//  1: backward
//  2: left
//  3: right
commandToArrow = [ArrowNames.North, ArrowNames.South, ArrowNames.West, ArrowNames.East]
showGroupLetter()
