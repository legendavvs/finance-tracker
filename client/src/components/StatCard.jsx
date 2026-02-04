import { Paper, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, icon, gradient }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        background: gradient, // Градієнтний фон
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)', // Підстрибує при наведенні
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
        },
      }}
    >
      {/* Велика іконка на фоні (декор) */}
      <Box
        sx={{
          position: 'absolute',
          right: -10,
          bottom: -20,
          opacity: 0.2,
          fontSize: '100px',
          transform: 'rotate(-15deg)',
        }}
      >
        {icon}
      </Box>

      <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 'bold', textTransform: 'uppercase' }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Paper>
  );
};

export default StatCard;