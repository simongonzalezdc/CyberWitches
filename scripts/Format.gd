extends Node

# Format with K, M, B suffixes
func short(value: float) -> String:
	if value < 1000.0:
		return str(int(value))
	
	var suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp"]
	var tier = 0
	
	while value >= 1000.0 and tier < suffixes.size() - 1:
		value /= 1000.0
		tier += 1
	
	return "%.2f%s" % [value, suffixes[tier]]

# Format with decimals
func precise(value: float, decimals: int = 2) -> String:
	return ("%." + str(decimals) + "f") % value

# Format time duration
func time_duration(seconds: float) -> String:
	var hrs = int(seconds / 3600)
	var mins = int((seconds - hrs * 3600) / 60)
	var secs = int(seconds - hrs * 3600 - mins * 60)
	
	if hrs > 0:
		return "%dh %dm" % [hrs, mins]
	elif mins > 0:
		return "%dm %ds" % [mins, secs]
	else:
		return "%ds" % secs

