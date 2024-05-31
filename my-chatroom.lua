Members = Members or {}


-- Modify `chatroom.lua` to include a handler for `Members`
-- to register to the chatroom with the following code:

  Handlers.add(
    "Register",
    Handlers.utils.hasMatchingTag("Action", "Register"),
    function (msg)
      table.insert(Members, msg.From)
      Handlers.utils.reply("registered")(msg)
    end
  )

  Handlers.add(
    "Broadcast",
    Handlers.utils.hasMatchingTag("Action", "Broadcast"),
    function (msg)
      for _, recipient in ipairs(Members) do
        ao.send({Target = recipient, Data = msg.Data})
      end
      Handlers.utils.reply("Broadcasted.")(msg)
    end
  )

  Say =
    function(text, ...)
        local arg = {...}
        local id = arg[1]
        if id ~= nil then
            -- Remember the new room for next time.
            DevChat.LastSend = DevChat.findRoom(id) or id
        end
        local name = DevChat.Rooms[DevChat.LastSend] or id
        ao.send({ Target = DevChat.LastSend, Action = "Broadcast", Data = text })
        if DevChat.Confirmations then
            return(DevChat.Colors.gray .. "Broadcasting to " .. DevChat.Colors.blue ..
                name .. DevChat.Colors.gray .. "..." .. DevChat.Colors.reset)
        else
            return ""
        end
    end
