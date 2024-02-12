def displaySelectedCommand():
    if selected:
        # Display if a command has been selected
        basic.show_arrow(commandToArrow[commandIndex])

def on_button_pressed_a():
    global group, commandIndex
    if buttonsLocked:
        return
    # Ignore if locked
    if not (selected):
        group = (group + 1) % len(letters)
        showGroupLetter()
        displaySelectedCommand()
    else:
        commandIndex = (commandIndex + 1) % 4
        displaySelectedCommand()
input.on_button_pressed(Button.A, on_button_pressed_a)

def showGroupLetter():
    basic.show_string("" + (letters[group]))

def sendCommand():
    global buttonsLocked, startTime
    buttonsLocked = True
    # Lock buttons during sending
    radio.send_number(commandIndex)
    startTime = input.running_time()
    
    def on_received_string(receivedString):
        global acknowledged
        # Blink the check symbol upon ACK
        if receivedString == "ACK":
            acknowledged = True
            blinkCheckSymbol()
    radio.on_received_string(on_received_string)
    
    # Allow up to 5 seconds for an ACK to be received
    while input.running_time() - startTime < 5000 and not (acknowledged):
        basic.show_arrow(commandToArrow[commandIndex])
        basic.pause(100)
        basic.clear_screen()
        basic.pause(100)
    # Show the cross for 2 seconds
    if not (acknowledged):
        # If not acknowledged within 5 seconds, show a cross
        basic.show_icon(IconNames.NO)
        basic.pause(2000)
    # Do not unlock buttons or clear the screen here if ACK received
    # as it's handled in blinkCheckSymbol function
    # Show the last selected direction
    if not (acknowledged):
        buttonsLocked = False
        # Unlock buttons only if not acknowledged
        basic.clear_screen()
        displaySelectedCommand()

def on_button_pressed_b():
    global selected
    if buttonsLocked:
        return
    # Ignore if locked
    if not (selected):
        selected = True
        radio.set_group(group + 1)
        basic.show_string("G" + letters[group])
    else:
        sendCommand()
input.on_button_pressed(Button.B, on_button_pressed_b)

# Return to showing the selected command
def blinkCheckSymbol():
    global blinkEndTime, buttonsLocked
    blinkEndTime = input.running_time() + 5000
    while input.running_time() < blinkEndTime:
        basic.show_icon(IconNames.YES)
        basic.pause(200)
        basic.clear_screen()
        basic.pause(200)
    buttonsLocked = False
    # Unlock buttons after blinking period
    displaySelectedCommand()
blinkEndTime = 0
startTime = 0
group = 0
buttonsLocked = False
commandIndex = 0
selected = False
commandToArrow: List[number] = []
letters: List[str] = []
acknowledged = False
letters = ["A", "B", "C", "D", "E"]
# Lock mechanism for buttons
radio.set_transmit_power(7)
# 0: forward
# 1: backward
# 2: left
# 3: right
commandToArrow = [ArrowNames.NORTH,
    ArrowNames.SOUTH,
    ArrowNames.WEST,
    ArrowNames.EAST]
showGroupLetter()