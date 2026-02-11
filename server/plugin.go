package main

import (
	"sync"

	"github.com/pkg/errors"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin"
	"github.com/mattermost/mattermost/server/public/pluginapi"
)

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin

	client *pluginapi.Client

	BotUserID string

	// configurationLock synchronizes access to the configuration.
	configurationLock sync.RWMutex

	// configuration is the active plugin configuration. Consult getConfiguration and
	// setConfiguration for usage.
	configuration *configuration
}

// BuildHash is the full git hash of the build.
var BuildHash string

// BuildHashShort is the short git hash of the build.
var BuildHashShort string

// BuildDate is the build date of the build.
var BuildDate string

// OnActivate runs when the plugin activates and ensures the plugin is properly
// configured.
func (p *Plugin) OnActivate() error {
	config := p.getConfiguration()
	err := config.IsValid()
	if err != nil {
		return errors.Wrap(err, "invalid config")
	}

	p.client = pluginapi.NewClient(p.API, p.Driver)

	bot := &model.Bot{
		Username:    "wrangler",
		DisplayName: "Wrangler",
		Description: "Created by the Wrangler plugin.",
	}

	botID, err := p.client.Bot.EnsureBot(bot, pluginapi.ProfileImagePath("assets/profile.png"))
	if err != nil {
		return errors.Wrap(err, "failed to ensure Wrangler bot")
	}
	p.BotUserID = botID

	err = p.API.RegisterCommand(getCommand(
		config.CommandAutoCompleteEnable,
		config.MergeThreadEnable,
	))
	if err != nil {
		return errors.Wrap(err, "failed to register wrangler command")
	}

	return nil
}
