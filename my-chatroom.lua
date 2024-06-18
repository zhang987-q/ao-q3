Handlers.add(
    "ReceiveDiscord",
    Handlers.utils.hasMatchingTag("Action", "ReceiveDiscord"),
    function(m)
        Say(m.Data)
    end
)
