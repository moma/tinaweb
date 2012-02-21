#
# default settings - uncomment any line to change the default value
# please keep in mind that users (browsers) can change theses values
# by using url parameters, like index.html?search=optics
#
default_config = 
  elementId: "vizdiv"          # element ID to which inject the viz
  gexf: ""                     # gexf file to load by default
  path: "js/tinaviz/"          # path to tinaviz (need the / at the end)
  assets: ""                   # use this as a path where are stored some assets (eg. icons)
  embed: no                    # if set to true, the config.getGraph function will be called. else, config.gexf will be called
  view: "macro"                # default view to show the graph
  category: "Document"         # default category used to show the graph
  node_id: ""                  # default node to select ("" means no node will be selected)
  search: ""                   # default search query ("" means no search will be run)
  a_node_size: 0.50            # node size for category A
  b_node_size: 0.50            # node size for category B
  cursor_size: 0.50            # default selection cursor size
  a_edge_filter_min: 0.0       # initial position of the edge filter for category A (lower-bound)
  a_edge_filter_max: 1.0       # initial position of the edge filter for category A (higher-bound)
  a_node_filter_min: 0.0       # initial position of the edge filter for category A (lower-bound)
  a_node_filter_max: 1.0       # initial position of the edge filter for category A (higher-bound)
  b_edge_filter_min: 0.0       # initial position of the edge filter for category B (lower-bound)
  b_edge_filter_max: 1.0       # initial position of the edge filter for category B (higher-bound)
  b_node_filter_min: 0.0       # initial position of the edge filter for category B (lower-bound)
  b_node_filter_max: 0.9       # initial position of the edge filter for category B (higher-bound)
  layout: "tinaforce"          # default layout (note: for the moment, only "tinaforce" is recommended)
  layout_speed: 30             # layout speed (in iterations by seconds)
  antialiasing_threshold: 1500 # max number of edges, before aliasing the scene (pixel aliasing)
  pause: off                   # should we be paused by default?
  demo: no                     # should we enable the demo mode?
